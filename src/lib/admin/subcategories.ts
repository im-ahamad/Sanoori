import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type SubcategoriesResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminSubcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  _count: {
    products: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSubcategoryList {
  items: AdminSubcategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminSubcategoryDetail {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  _count: {
    products: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function listAdminSubcategories(
  params: {
    q?: string;
    categoryId?: string;
    page?: number;
  } = {}
): Promise<SubcategoriesResult<AdminSubcategoryList>> {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const pageSize = 20;

  const q = params.q?.trim() ?? "";
  const categoryId = params.categoryId ?? "";

  const where: Prisma.SubcategoryWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      categoryId ? { categoryId } : {},
    ],
  };

  try {
    const [total, subcategories] = await Promise.all([
      db.subcategory.count({ where }),
      db.subcategory.findMany({
        where,
        orderBy: [{ name: "asc" }],
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          category: { select: { name: true } },
          _count: { select: { products: true } },
        },
      }),
    ]);

    return {
      ok: true,
      data: {
        items: subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          categoryId: subcategory.categoryId,
          categoryName: subcategory.category.name,
          _count: { products: subcategory._count.products },
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  } catch (error) {
    console.error("Failed to list subcategories", error);
    return { ok: false, error: "database" };
  }
}

export type AdminSubcategoryDetailResult =
  | { ok: true; data: AdminSubcategoryDetail }
  | { ok: false; error: "database" | "not-found" };

export async function getAdminSubcategoryDetail(
  id: string
): Promise<AdminSubcategoryDetailResult> {
  try {
    const subcategory = await db.subcategory.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        _count: { select: { products: true } },
      },
    });

    if (!subcategory) return { ok: false, error: "not-found" };

    return {
      ok: true,
      data: {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId,
        categoryName: subcategory.category.name,
        _count: { products: subcategory._count.products },
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      },
    };
  } catch (error) {
    console.error("Failed to load subcategory detail", error);
    return { ok: false, error: "database" };
  }
}

export async function getSubcategoriesForCategory(
  categoryId: string
): Promise<SubcategoriesResult<Array<{ id: string; name: string }>>> {
  try {
    const subcategories = await db.subcategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return {
      ok: true,
      data: subcategories,
    };
  } catch (error) {
    console.error("Failed to load subcategories for category", error);
    return { ok: false, error: "database" };
  }
}

export async function getAllCategoriesForSubcategoryForm(): Promise<
  SubcategoriesResult<Array<{ id: string; name: string }>>
> {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    });

    return {
      ok: true,
      data: categories,
    };
  } catch (error) {
    console.error("Failed to load categories for subcategory form", error);
    return { ok: false, error: "database" };
  }
}