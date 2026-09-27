"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type CreateSubcategoryActionResult =
  | { ok: true; message: string; fieldErrors?: Record<string, string[]> }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const createSubcategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z.string().trim().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  categoryId: z.string().trim().min(1, "Category is required"),
});

export async function createSubcategoryAction(
  _prevState: CreateSubcategoryActionResult | undefined,
  formData: FormData
): Promise<CreateSubcategoryActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = createSubcategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, message: "Validation failed", fieldErrors };
  }

  try {
    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      return { ok: false, message: "Category not found", fieldErrors: { categoryId: ["Category not found"] } };
    }

    // Check for duplicate slug
    const existingSlug = await db.subcategory.findUnique({ where: { slug: parsed.data.slug } });
    if (existingSlug) {
      return { ok: false, message: "A subcategory with this slug already exists", fieldErrors: { slug: ["A subcategory with this slug already exists"] } };
    }

    // Check for duplicate name within the same category
    const existingName = await db.subcategory.findFirst({
      where: { name: parsed.data.name, categoryId: parsed.data.categoryId },
    });
    if (existingName) {
      return { ok: false, message: "A subcategory with this name already exists in this category", fieldErrors: { name: ["A subcategory with this name already exists in this category"] } };
    }

    const created = await db.subcategory.create({
      data: parsed.data,
      select: { id: true },
    });

    revalidatePath("/admin/subcategories");
    redirect(`/admin/subcategories/${created.id}/edit?created=1`);
  } catch (error) {
    console.error("Failed to create subcategory", error);
    return { ok: false, message: "Something went wrong while creating the subcategory" };
  }
}

export type UpdateSubcategoryActionResult =
  | { ok: true; message: string; fieldErrors?: Record<string, string[]> }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const updateSubcategorySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z.string().trim().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  categoryId: z.string().trim().min(1, "Category is required"),
});

export async function updateSubcategoryAction(
  _prevState: UpdateSubcategoryActionResult | undefined,
  formData: FormData
): Promise<UpdateSubcategoryActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = updateSubcategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, message: "Validation failed", fieldErrors };
  }

  const { id, ...data } = parsed.data;

  try {
    // Check if subcategory exists
    const existingSubcategory = await db.subcategory.findUnique({ where: { id } });
    if (!existingSubcategory) {
      return { ok: false, message: "Subcategory not found" };
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return { ok: false, message: "Category not found", fieldErrors: { categoryId: ["Category not found"] } };
    }

    // Check for duplicate slug (excluding current)
    const existingSlug = await db.subcategory.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existingSlug) {
      return { ok: false, message: "A subcategory with this slug already exists", fieldErrors: { slug: ["A subcategory with this slug already exists"] } };
    }

    // Check for duplicate name within the same category (excluding current)
    const existingName = await db.subcategory.findFirst({
      where: { name: data.name, categoryId: data.categoryId, NOT: { id } },
    });
    if (existingName) {
      return { ok: false, message: "A subcategory with this name already exists in this category", fieldErrors: { name: ["A subcategory with this name already exists in this category"] } };
    }

    await db.subcategory.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/subcategories");
    revalidatePath(`/admin/subcategories/${id}/edit`);
    redirect("/admin/subcategories?updated=1");
  } catch (error) {
    console.error("Failed to update subcategory", error);
    return { ok: false, message: "Something went wrong while updating the subcategory" };
  }
}

export type DeleteSubcategoryActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function deleteSubcategoryAction(
  _prevState: DeleteSubcategoryActionResult | undefined,
  formData: FormData
): Promise<DeleteSubcategoryActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, message: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Subcategory ID is required" };

  try {
    // Check if subcategory exists and count products
    const subcategory = await db.subcategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subcategory) {
      return { ok: false, message: "Subcategory not found" };
    }

    if (subcategory._count.products > 0) {
      return {
        ok: false,
        message: `This subcategory is currently used by ${subcategory._count.products} product${subcategory._count.products !== 1 ? "s" : ""}. Reassign or remove those products before deleting.`,
      };
    }

    await db.subcategory.delete({ where: { id } });

    revalidatePath("/admin/subcategories");
    redirect("/admin/subcategories?deleted=1");
  } catch (error) {
    console.error("Failed to delete subcategory", error);
    return { ok: false, message: "Something went wrong while deleting the subcategory" };
  }
}