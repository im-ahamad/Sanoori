"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type CreateCategoryActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url().max(500).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function createCategoryAction(
  _prevState: CreateCategoryActionResult | undefined,
  formData: FormData
): Promise<CreateCategoryActionResult> {
  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    displayOrder: formData.get("displayOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  try {
    // Check for duplicate slug
    const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return { ok: false, message: "A category with this slug already exists" };
    }

    await db.category.create({
      data: parsed.data,
    });

    revalidatePath("/admin/categories");
    return { ok: true, message: "Category created successfully" };
  } catch (error) {
    console.error("Failed to create category", error);
    return { ok: false, message: "Something went wrong while creating the category" };
  }
}

export type UpdateCategoryActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const updateCategorySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url().max(500).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function updateCategoryAction(
  _prevState: UpdateCategoryActionResult | undefined,
  formData: FormData
): Promise<UpdateCategoryActionResult> {
  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    displayOrder: formData.get("displayOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((e) => e.message).join("; ") };
  }

  const { id, ...data } = parsed.data;

  try {
    // Check for duplicate slug (excluding current)
    const existing = await db.category.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existing) {
      return { ok: false, message: "A category with this slug already exists" };
    }

    await db.category.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}/edit`);
    return { ok: true, message: "Category updated successfully" };
  } catch (error) {
    console.error("Failed to update category", error);
    return { ok: false, message: "Something went wrong while updating the category" };
  }
}

export type DeleteCategoryActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function deleteCategoryAction(
  _prevState: DeleteCategoryActionResult | undefined,
  formData: FormData
): Promise<DeleteCategoryActionResult> {
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Category ID is required" };

  try {
    // Check if category has products or subcategories
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
    });

    if (!category) {
      return { ok: false, message: "Category not found" };
    }

    if (category._count.products > 0 || category._count.subcategories > 0) {
      return {
        ok: false,
        message: "Cannot delete category with products or subcategories. Move or delete them first.",
      };
    }

    await db.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    return { ok: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Failed to delete category", error);
    return { ok: false, message: "Something went wrong while deleting the category" };
  }
}