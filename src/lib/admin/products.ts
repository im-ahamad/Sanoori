import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Availability } from "@/generated/prisma";
import type { AdminProductImage } from "@/lib/admin/product-images";

/**
 * Server-only data access for admin product management.
 *
 * Every read here is scoped to admin pages and never imported from client
 * components. Errors surface as discriminated results so pages can render a
 * friendly state without leaking database internals.
 */

export type ProductResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface AdminProductOption {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

export async function getAdminProductOptions(): Promise<
  ProductResult<AdminProductOption[]>
> {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    });

    return {
      ok: true,
      data: categories.map((category) => ({
        id: category.id,
        name: category.name,
        subcategories: category.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
        })),
      })),
    };
  } catch (error) {
    console.error("Failed to load admin product options", error);
    return { ok: false, error: "database" };
  }
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  categoryName: string;
  subcategoryName: string | null;
  availability: Availability;
  featured: boolean;
  isActive: boolean;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProductListParams {
  q?: string;
  categoryId?: string;
  availability?: string;
  featured?: string;
  page?: number;
}

export interface AdminProductListData {
  items: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const VALID_AVAILABILITY = new Set([
  "IN_STOCK",
  "ON_REQUEST",
  "OUT_OF_STOCK",
]);

const PAGE_SIZE = 10;

function parseFeatured(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1" || value === "yes") return true;
  if (value === "false" || value === "0" || value === "no") return false;
  return undefined;
}

export async function listAdminProducts(
  params: AdminProductListParams
): Promise<ProductResult<AdminProductListData>> {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const pageSize = PAGE_SIZE;

  const q = params.q?.trim() ?? "";
  const featured = parseFeatured(params.featured);
  const availability = VALID_AVAILABILITY.has(params.availability ?? "")
    ? (params.availability as Availability)
    : undefined;

  const where: Prisma.ProductWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
              { productCode: { contains: q, mode: "insensitive" as const } },
              { id: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      params.categoryId
        ? { categoryId: params.categoryId }
        : {},
      availability ? { availability } : {},
      featured !== undefined ? { featured } : {},
    ],
  };

  try {
    const [total, items] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
          _count: { select: { images: true } },
        },
      }),
    ]);

    return {
      ok: true,
      data: {
        items: items.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          productCode: product.productCode,
          categoryName: product.category.name,
          subcategoryName: product.subcategory?.name ?? null,
          availability: product.availability,
          featured: product.featured,
          isActive: product.isActive,
          imageCount: product._count.images,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  } catch (error) {
    console.error("Failed to list admin products", error);
    return { ok: false, error: "database" };
  }
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  categoryId: string;
  subcategoryId: string | null;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  specifications: Record<string, string> | null;
  variants: Array<Record<string, string>>;
  availability: Availability;
  featured: boolean;
  isActive: boolean;
  material: string | null;
  size: string | null;
  colorFinish: string | null;
  showOnHome: boolean;
  showOnProducts: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageCount: number;
  inquiryCount: number;
  images: AdminProductImage[];
}

function toRecord(
  value: unknown
): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    record[key] = typeof item === "string" ? item : JSON.stringify(item);
  }
  return record;
}

function toVariants(value: unknown): Array<Record<string, string>> {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 60)
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object" && !Array.isArray(item)
    )
    .map((item) => toRecord(item) ?? {});
}

export async function getAdminProductDetail(
  id: string
): Promise<ProductResult<AdminProductDetail | null>> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        _count: { select: { images: true, inquiries: true } },
        images: { orderBy: { sortOrder: "asc" }, select: {
          id: true,
          productId: true,
          publicId: true,
          url: true,
          alt: true,
          sortOrder: true,
          createdAt: true,
        } },
      },
    });

    if (!product) return { ok: true, data: null };

    return {
      ok: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        productCode: product.productCode,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        shortDescription: product.shortDescription,
        description: product.description,
        features: product.features,
        specifications: toRecord(product.specifications),
        variants: toVariants(product.variants),
        availability: product.availability,
        featured: product.featured,
        isActive: product.isActive,
        material: product.material,
        size: product.size,
        colorFinish: product.colorFinish,
        showOnHome: product.showOnHome,
        showOnProducts: product.showOnProducts,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        imageCount: product._count.images,
        inquiryCount: product._count.inquiries,
        images: product.images,
      },
    };
  } catch (error) {
    console.error("Failed to load admin product detail", error);
    return { ok: false, error: "database" };
  }
}