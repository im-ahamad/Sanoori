"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCTS_CACHE_TAG } from "@/lib/cache";
import { Prisma } from "@/generated/prisma/client";
import type { Availability } from "@/generated/prisma";
import {
  productDeleteSchema,
  productFormSchema,
} from "@/lib/validators/product";
import { destroyAssetsForProduct } from "@/lib/admin/product-images";
import { hasPermission, type UserRole, type Permission } from "@/lib/auth/permissions";

/**
 * Server actions backing the admin product management screens.
 *
 * Every mutation re-authenticates the session and re-checks permissions
 * server-side — the UI gating in the layout is not the security boundary.
 * All input is validated with Zod before touching the database, and failures
 * return friendly messages without leaking database internals.
 */

export type ProductActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | undefined;

const INITIAL_FIELD_ERRORS: Record<string, string[]> = {};

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

function unauthorizedState(): ProductActionState {
  return {
    status: "error",
    message:
      "You are not authorized to manage products. Please sign in again and retry.",
  };
}

function genericFailureState(): ProductActionState {
  return {
    status: "error",
    message:
      "Something went wrong while saving this product. Please try again.",
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

async function validateCategoryAndSubcategory(
  categoryId: string,
  subcategoryId: string | null
): Promise<string | null> {
  const category = await db.category.findFirst({
    where: { id: categoryId, isActive: true },
    select: { id: true },
  });
  if (!category) return "The selected category is invalid or unavailable.";

  if (subcategoryId) {
    const subcategory = await db.subcategory.findFirst({
      where: { id: subcategoryId, categoryId },
      select: { id: true },
    });
    if (!subcategory) {
      return "The selected subcategory does not belong to the chosen category.";
    }
  }

  return null;
}

async function ensureUniqueSlug(
  slug: string,
  currentProductId: string | null
): Promise<boolean> {
  const existing = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!existing) return true;
  return currentProductId !== null && existing.id === currentProductId;
}

function serializeSpecifications(
  entries: Array<{ key: string; value: string }>
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const entry of entries) {
    if (entry.key) record[entry.key] = entry.value;
  }
  return record;
}

function serializeVariants(
  entries: Array<{ key: string; value: string }>
): Array<Record<string, string>> {
  return entries
    .filter((entry) => entry.key)
    .map((entry) => ({ [entry.key]: entry.value }));
}

async function writeProduct(
  formData: FormData,
  expectedProductId: string | "create"
): Promise<ProductActionState> {
  if (!(await requirePermission("products:write"))) return unauthorizedState();

  const parsed = productFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      status: "error",
      message:
        "Please fix the highlighted fields and try again.",
      fieldErrors: flattened.fieldErrors ?? INITIAL_FIELD_ERRORS,
    };
  }

  const input = parsed.data;

  if (expectedProductId !== "create" && input.productId !== expectedProductId) {
    return {
      status: "error",
      message: "This product form is out of date. Please reload and try again.",
    };
  }

  let categoryError: string | null = null;
  let slugUnique = false;
  try {
    categoryError = await validateCategoryAndSubcategory(
      input.categoryId,
      input.subcategoryId
    );
    slugUnique = await ensureUniqueSlug(
      input.slug,
      expectedProductId === "create" ? null : expectedProductId
    );
  } catch (error) {
    console.error("Failed to validate product", error);
    return genericFailureState();
  }
  if (categoryError) return { status: "error", message: categoryError };
  if (!slugUnique) {
    return {
      status: "error",
      message: "A product with this slug already exists. Try a different slug.",
      fieldErrors: { slug: ["This slug is already in use by another product."] },
    };
  }

  const data = {
    name: input.name,
    slug: input.slug,
    productCode: input.productCode,
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    shortDescription: input.shortDescription,
    description: input.description,
    features: input.features,
    specifications: serializeSpecifications(input.specifications),
    variants: serializeVariants(input.variants),
    availability: input.availability as Availability,
    featured: input.featured,
    isActive: input.isActive,
    material: input.material,
    size: input.size,
    colorFinish: input.colorFinish,
    showOnHome: input.showOnHome,
    showOnProducts: input.showOnProducts,
  };

  let createdId: string | null = null;

  try {
    if (expectedProductId === "create") {
      const created = await db.product.create({
        data,
        select: { id: true },
      });
      createdId = created.id;
    } else {
      await db.product.update({
        where: { id: expectedProductId },
        data,
      });
    }

    revalidatePath("/admin/products");
    revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message:
          "A product with this slug (or product code) already exists. Try a different value.",
        fieldErrors: { slug: ["This value is already in use by another product."] },
      };
    }
    console.error("Failed to write product", error);
    return genericFailureState();
  }

  redirect(
    expectedProductId === "create"
      ? `/admin/products/${createdId}/edit?created=1`
      : "/admin/products?updated=1"
  );
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  return writeProduct(formData, "create");
}

export async function updateProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || productId.trim() === "") {
    return { status: "error", message: "Missing product ID." };
  }
  return writeProduct(formData, productId);
}

export async function deleteProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  if (!(await requirePermission("products:delete"))) return unauthorizedState();

  const parsed = productDeleteSchema.safeParse({
    productId: formData.get("productId"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Missing product ID." };
  }

  try {
    const existing = await db.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true },
    });
    if (!existing) {
      return {
        status: "error",
        message: "This product no longer exists. It may have been deleted already.",
      };
    }

    const assetsCleanup = await destroyAssetsForProduct(parsed.data.productId);
    if (!assetsCleanup.ok) {
      return {
        status: "error",
        message: assetsCleanup.error,
      };
    }

    await db.product.delete({ where: { id: parsed.data.productId } });
  } catch (error) {
    console.error("Failed to delete product", error);
    return genericFailureState();
  }

  revalidatePath("/admin/products");
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  redirect("/admin/products?deleted=1");
}

export type FeaturedToggleResult =
  | { ok: true; featured: boolean }
  | { ok: false; error: string };

async function loadAdminContext(
  productId: string
): Promise<{ featured: boolean } | { error: string }> {
  if (!(await requirePermission("products:write"))) {
    return { error: "You are not authorized to manage products." };
  }
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, featured: true },
  });
  if (!product) return { error: "This product no longer exists." };
  return { featured: product.featured };
}

export async function toggleProductFeaturedAction(
  productId: string,
  featured: boolean
): Promise<FeaturedToggleResult> {
  const context = await loadAdminContext(productId);
  if ("error" in context) return { ok: false, error: context.error };

  if (context.featured === featured) {
    return { ok: true, featured };
  }

  try {
    await db.product.update({
      where: { id: productId },
      data: { featured },
    });
  } catch (error) {
    console.error("Failed to toggle product featured flag", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidateTag(PRODUCTS_CACHE_TAG, 'max');
  return { ok: true, featured };
}