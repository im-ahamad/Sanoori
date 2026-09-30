"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCTS_CACHE_TAG } from "@/lib/cache";
import {
  getSignedUploadParams,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import {
  attachUploadedImage,
  deleteProductImage,
  productExists,
  reorderProductImages,
  updateProductImageAlt,
  type AdminProductImage,
  type ImageActionResult,
} from "@/lib/admin/product-images";
import {
  ATTACH_IMAGE_SCHEMA,
  DELETE_IMAGE_SCHEMA,
  REORDER_IMAGES_SCHEMA,
  SIGN_UPLOAD_SCHEMA,
  UPDATE_IMAGE_ALT_SCHEMA,
  type SignUploadInput,
  type AttachImageInput,
  type DeleteImageInput,
  type ReorderImagesInput,
  type UpdateImageAltInput,
} from "@/lib/validators/product-images";
import { hasPermission, type UserRole, type Permission } from "@/lib/auth/permissions";

/**
 * Server actions backing the admin product image manager.
 *
 * Every action re-authenticates the session and re-checks permissions
 * server-side, validates input with Zod, and only then touches the database.
 * The Cloudinary API secret never leaves the server: the browser receives a
 * short-lived signature that only works for ONE upload scoped to ONE product.
 */

async function getUserPermissions(): Promise<{ role: UserRole; permissions: unknown } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { role: user.role as UserRole, permissions: user.permissions };
}

function requirePermission(permission: Permission): Promise<boolean> {
  return getUserPermissions().then((user) => {
    if (!user) return false;
    return hasPermission(user.role, user.permissions, permission);
  });
}

function unauthorizedError(): string {
  return "You are not authorized to manage products. Please sign in again and retry.";
}

function firstErrorMessage(result: ZodError): string {
  const issue = result.issues[0];
  return issue ? issue.message : "Invalid input.";
}

export interface SignedUploadData {
  endpoint: string;
  params: Record<string, string | number>;
  signature: string;
  publicId: string;
}

export type SignedUploadResult =
  | { ok: true; data: SignedUploadData }
  | { ok: false; error: string };

export async function getSignedUploadParamsAction(
  input: SignUploadInput
): Promise<SignedUploadResult> {
  if (!(await requirePermission("products:images"))) {
    return { ok: false, error: unauthorizedError() };
  }

  const parsed = SIGN_UPLOAD_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error:
        "Image storage is not configured yet. Contact the site administrator.",
    };
  }

  try {
    if (!(await productExists(parsed.data.productId))) {
      return { ok: false, error: "This product no longer exists." };
    }

    const uniqueSuffix = `img-${Date.now().toString(36)}-${globalThis.crypto.randomUUID()}`;
    const signed = getSignedUploadParams(parsed.data.productId, uniqueSuffix);
    return { ok: true, data: signed };
  } catch (error) {
    console.error("Failed to sign an image upload", error);
    return { ok: false, error: "Could not prepare the image upload." };
  }
}

export type AttachImageResult =
  | { ok: true; data: AdminProductImage }
  | { ok: false; error: string };

export async function attachImageAction(
  input: AttachImageInput
): Promise<AttachImageResult> {
  if (!(await requirePermission("products:images"))) {
    return { ok: false, error: unauthorizedError() };
  }

  const parsed = ATTACH_IMAGE_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const result = await attachUploadedImage(
    parsed.data.productId,
    parsed.data.publicId
  );

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  return { ok: true, data: result.data };
}

export type ReorderImagesResult = { ok: true } | { ok: false; error: string };

export async function reorderImagesAction(
  input: ReorderImagesInput
): Promise<ReorderImagesResult> {
  if (!(await requirePermission("products:images"))) {
    return { ok: false, error: unauthorizedError() };
  }

  const parsed = REORDER_IMAGES_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const result = await reorderProductImages(
    parsed.data.productId,
    parsed.data.orderedIds
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  return { ok: true };
}

export type UpdateImageAltResult = { ok: true } | { ok: false; error: string };

export async function updateImageAltAction(
  input: UpdateImageAltInput
): Promise<UpdateImageAltResult> {
  if (!(await requirePermission("products:images"))) {
    return { ok: false, error: unauthorizedError() };
  }

  const parsed = UPDATE_IMAGE_ALT_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const result: ImageActionResult<{
    imageId: string;
    productId: string;
  }> = await updateProductImageAlt(parsed.data.imageId, parsed.data.alt);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/products/${result.data.productId}/edit`);
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  return { ok: true };
}

export type DeleteImageResult = { ok: true } | { ok: false; error: string };

export async function deleteImageAction(
  input: DeleteImageInput
): Promise<DeleteImageResult> {
  if (!(await requirePermission("products:images"))) {
    return { ok: false, error: unauthorizedError() };
  }

  const parsed = DELETE_IMAGE_SCHEMA.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const result = await deleteProductImage(
    parsed.data.productId,
    parsed.data.imageId
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  return { ok: true };
}