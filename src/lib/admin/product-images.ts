import "server-only";
import { db } from "@/lib/db";
import {
  cloudinaryDeliveryUrl,
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  isPublicIdForProduct,
  verifyCloudinaryResource,
} from "@/lib/cloudinary";
import {
  IMAGE_ACCEPTED_MIME,
  IMAGE_MAX_PER_PRODUCT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
} from "@/lib/validators/product-images";

/**
 * Server-only data access for admin product image management.
 *
 * The browser uploads the raw file directly to Cloudinary using a signature
 * this server generated. After the upload completes the browser calls
 * `attachUploadedImage`, which re-verifies server-side that Cloudinary really
 * holds a compliant asset for THIS product before any database row is written.
 */

export interface AdminProductImage {
  id: string;
  productId: string;
  publicId: string | null;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: Date;
}

export type ImageActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type SimpleResult = { ok: true } | { ok: false; error: string };

const FORMAT_BY_MIME: Record<(typeof IMAGE_ACCEPTED_MIME)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function toAdminProductImage(
  image: {
    id: string;
    productId: string;
    publicId: string | null;
    url: string;
    alt: string | null;
    sortOrder: number;
    createdAt: Date;
  }
): AdminProductImage {
  return {
    id: image.id,
    productId: image.productId,
    publicId: image.publicId,
    url: image.url,
    alt: image.alt,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt,
  };
}

export async function productExists(productId: string): Promise<boolean> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  return Boolean(product);
}

export async function getProductImages(
  productId: string
): Promise<AdminProductImage[]> {
  const images = await db.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return images.map(toAdminProductImage);
}

export async function attachUploadedImage(
  productId: string,
  publicId: string
): Promise<ImageActionResult<AdminProductImage>> {
  try {
    if (!(await productExists(productId))) {
      return { ok: false, error: "This product no longer exists." };
    }
    if (!isCloudinaryConfigured()) {
      return {
        ok: false,
        error:
          "Image storage is not configured. Contact the site administrator.",
      };
    }
    if (!isPublicIdForProduct(publicId, productId)) {
      return {
        ok: false,
        error: "This image was not uploaded for this product.",
      };
    }

    const verification = await verifyCloudinaryResource(publicId);
    if (!verification.ok) {
      return {
        ok: false,
        error:
          "We could not verify the uploaded image with the storage provider.",
      };
    }
    const { resource } = verification;

    if (resource.resourceType !== "image") {
      await destroyCloudinaryAsset(publicId);
      return { ok: false, error: "The uploaded file is not a valid image." };
    }

    const allowedFormats = new Set(Object.values(FORMAT_BY_MIME));
    if (!allowedFormats.has(resource.format)) {
      await destroyCloudinaryAsset(publicId);
      return {
        ok: false,
        error: "Only JPG, PNG, and WebP images are allowed.",
      };
    }

    if (resource.bytes > IMAGE_MAX_SIZE_BYTES) {
      await destroyCloudinaryAsset(publicId);
      return {
        ok: false,
        error: `Images must be smaller than ${IMAGE_MAX_SIZE_MB} MB.`,
      };
    }

    const existing = await db.productImage.findMany({
      where: { productId },
      select: { id: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });
    if (existing.length >= IMAGE_MAX_PER_PRODUCT) {
      await destroyCloudinaryAsset(publicId);
      return {
        ok: false,
        error: `A product can have at most ${IMAGE_MAX_PER_PRODUCT} images.`,
      };
    }

    const nextSortOrder =
      existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

    const created = await db.productImage.create({
      data: {
        productId,
        publicId,
        url: cloudinaryDeliveryUrl(publicId),
        alt: null,
        sortOrder: nextSortOrder,
      },
    });

    return { ok: true, data: toAdminProductImage(created) };
  } catch (error) {
    console.error("Failed to attach product image", error);
    return {
      ok: false,
      error: "Something went wrong while saving the image. Please try again.",
    };
  }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<SimpleResult> {
  try {
    const existing = await db.productImage.findMany({
      where: { productId },
      select: { id: true },
    });
    const existingIds = existing.map((image) => image.id).sort();
    const ordered = [...new Set(orderedIds)].sort();

    const sameMembership =
      existingIds.length === ordered.length &&
      existingIds.every((id, index) => id === ordered[index]);

    if (!sameMembership) {
      return {
        ok: false,
        error:
          "The image list changed while reordering. Please refresh and try again.",
      };
    }

    await db.$transaction(
      orderedIds.map((imageId, index) =>
        db.productImage.update({
          where: { id: imageId, productId },
          data: { sortOrder: index },
        })
      )
    );

    return { ok: true };
  } catch (error) {
    console.error("Failed to reorder product images", error);
    return {
      ok: false,
      error: "Something went wrong while reordering. Please try again.",
    };
  }
}

export async function updateProductImageAlt(
  imageId: string,
  alt: string
): Promise<ImageActionResult<{ imageId: string; productId: string }>> {
  try {
    const existing = await db.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, productId: true },
    });
    if (!existing) {
      return { ok: false, error: "This image no longer exists." };
    }
    await db.productImage.update({
      where: { id: imageId },
      data: { alt },
    });
    return { ok: true, data: { imageId, productId: existing.productId } };
  } catch (error) {
    console.error("Failed to update product image alt", error);
    return {
      ok: false,
      error: "Something went wrong while saving the alt text. Please try again.",
    };
  }
}

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<SimpleResult> {
  try {
    const image = await db.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      return { ok: false, error: "This image no longer exists." };
    }

    if (image.publicId) {
      const destroyed = await destroyCloudinaryAsset(image.publicId);
      if (!destroyed.ok) {
        return {
          ok: false,
          error:
            "The image could not be removed from storage yet. Please try again.",
        };
      }
    }

    try {
      await db.productImage.delete({ where: { id: imageId } });
    } catch (error) {
      console.error("Failed to delete product image record", error);
      if (image.publicId) {
        // The remote asset is already gone; keep the DB record consistent as
        // best effort so the admin can retry deletion later.
        await destroyCloudinaryAsset(image.publicId);
      }
      return {
        ok: false,
        error: "Something went wrong while deleting the image. Please try again.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Failed to delete product image", error);
    return {
      ok: false,
      error: "Something went wrong while deleting the image. Please try again.",
    };
  }
}

/**
 * Destroys every Cloudinary asset belonging to a product. Called BEFORE the
 * product row is deleted so that a failure aborts the product deletion instead
 * of leaving orphaned remote assets behind.
 */
export async function destroyAssetsForProduct(
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const images = await db.productImage.findMany({
      where: { productId, publicId: { not: null } },
      select: { publicId: true },
    });

    for (const image of images) {
      if (!image.publicId) continue;
      const destroyed = await destroyCloudinaryAsset(image.publicId);
      if (!destroyed.ok) {
        return {
          ok: false,
          error:
            "Some product images could not be removed from storage. The product was not deleted. Please try again.",
        };
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Failed to destroy product assets", error);
    return {
      ok: false,
      error: "Something went wrong while cleaning up images. Please try again.",
    };
  }
}