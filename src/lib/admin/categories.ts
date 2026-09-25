import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type CategoriesResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  _count: {
    products: number;
    subcategories: number;
  };
  subcategories?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: { products: number };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCategoryList {
  items: AdminCategory[];
}

export async function listAdminCategories(): Promise<CategoriesResult<AdminCategoryList>> {
  try {
    const categories = await db.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
        subcategories: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
      },
    });

    return {
      ok: true,
      data: { items: categories as AdminCategory[] },
    };
  } catch (error) {
    console.error("Failed to list categories", error);
    return { ok: false, error: "database" };
  }
}

export type AdminCategoryDetailResult =
  | { ok: true; data: AdminCategory }
  | { ok: false; error: "database" | "not-found" };

export async function getAdminCategoryDetail(
  id: string
): Promise<AdminCategoryDetailResult> {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
        subcategories: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
      },
    });

    if (!category) return { ok: false, error: "not-found" };

    return { ok: true, data: category as AdminCategory };
  } catch (error) {
    console.error("Failed to load category detail", error);
    return { ok: false, error: "database" };
  }
}