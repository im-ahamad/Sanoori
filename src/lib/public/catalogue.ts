import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Availability } from "@/generated/prisma/enums";
import { PRODUCTS_CACHE_TAG } from "@/lib/cache";
import {
  buildImageUrl,
  productImageHero,
  productImageThumb,
} from "@/lib/cloudinary-url";

/**
 * Public product catalogue data access.
 *
 * Every read here is server-only. It is the single source of truth for the
 * public website (catalogue, filters, product details); nothing on the public
 * side queries the database directly. Only products with `isActive: true` are
 * ever returned — admin-managed drafts stay invisible to customers.
 *
 * Reads are memoized with `unstable_cache` (tagged `products`) and invalidated
 * from admin mutations via `revalidateTag`, so catalogue data reflects admin
 * changes without indefinite staleness.
 */

export const PUBLIC_PRODUCTS_PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Public types (plain serializable objects)
// ---------------------------------------------------------------------------

export interface PublicSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Only kept when it is an absolute URL served by an image host. */
  image: string | null;
  displayOrder: number;
  subcategories: PublicSubcategory[];
}

export interface PublicProductCardImage {
  /** Optimized Cloudinary URL sized for catalogue cards. */
  url: string;
  alt: string | null;
}

export interface PublicProductSummary {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  shortDescription: string | null;
  availability: Availability;
  featured: boolean;
  image: PublicProductCardImage | null;
}

export interface PublicProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface PublicProductDetail {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  specifications: Record<string, string> | null;
  variants: Array<Record<string, string>>;
  availability: Availability;
  featured: boolean;
  images: PublicProductImage[];
  primaryImage: PublicProductImage | null;
}

export interface PublicProductOption {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  categoryName: string;
  categorySlug: string;
  imageUrl: string | null;
}

export interface PublicProductFilters {
  q?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
  availability?: Availability;
  page?: number;
}

export interface PublicProductListData {
  items: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUsableImageUrl(image: string | null | undefined): boolean {
  if (!image) return false;
  const value = image.trim();
  // Absolute delivery URLs (Cloudinary) are served as-is. Root-relative
  // `/images/...` paths point at locally-served files in /public, which this
  // stack also supports through the same ProductImage model.
  return /^https?:\/\/.+/i.test(value) || value.startsWith("/images/");
}

function cardImageUrl(url: string): string {
  // 4:3 crop tuned for catalogue cards — small, auto format/quality.
  return buildImageUrl(url, {
    width: 640,
    height: 480,
    format: "auto",
    quality: "auto",
  });
}

/**
 * Normalizes a Product (with its category/subcategory/images included) into the
 * serializable public card summary shared by the catalogue and the home page.
 */
function toProductSummary(product: {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  shortDescription: string | null;
  availability: Availability;
  featured: boolean;
  category: { name: string; slug: string };
  subcategory: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
}): PublicProductSummary {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productCode: product.productCode,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    subcategoryName: product.subcategory?.name ?? null,
    subcategorySlug: product.subcategory?.slug ?? null,
    shortDescription: product.shortDescription,
    availability: product.availability,
    featured: product.featured,
    image:
      product.images.length > 0 && isUsableImageUrl(product.images[0].url)
        ? {
            url: cardImageUrl(product.images[0].url),
            alt: product.images[0].alt,
          }
        : null,
  };
}

const ACTIVE_AVAILABILITY = new Set<Availability>([
  "IN_STOCK",
  "ON_REQUEST",
  "OUT_OF_STOCK",
]);

function parsePage(value: number | undefined): number {
  const page = Math.max(1, Math.floor(Number(value) || 1));
  return page;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const getPublicCategories = unstable_cache(
  async (): Promise<PublicCategory[]> => {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: isUsableImageUrl(category.image) ? category.image : null,
      displayOrder: category.displayOrder,
      subcategories: category.subcategories,
    }));
  },
  ["public-categories"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

export const getPublicProducts = unstable_cache(
  async (
    filters: PublicProductFilters
  ): Promise<PublicProductListData> => {
    const page = parsePage(filters.page);
    const pageSize = PUBLIC_PRODUCTS_PAGE_SIZE;
    const q = filters.q?.trim() ?? "";
    const featured =
      filters.featured === undefined ? undefined : Boolean(filters.featured);
    const availability = ACTIVE_AVAILABILITY.has(
      filters.availability as Availability
    )
      ? (filters.availability as Availability)
      : undefined;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { slug: { contains: q, mode: "insensitive" as const } },
                { productCode: { contains: q, mode: "insensitive" as const } },
                { shortDescription: { contains: q, mode: "insensitive" as const } },
                { category: { name: { contains: q, mode: "insensitive" as const } } },
                { subcategory: { name: { contains: q, mode: "insensitive" as const } } },
              ],
            }
          : {},
        filters.categorySlug
          ? { category: { slug: filters.categorySlug } }
          : {},
        filters.subcategorySlug
          ? { subcategory: { slug: filters.subcategorySlug } }
          : {},
        featured !== undefined ? { featured } : {},
        availability ? { availability } : {},
      ],
    };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      }),
    ]);

    return {
      items: products.map(toProductSummary),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },
  ["public-products"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

/**
 * Curated selection for the home page product showcase.
 *
 * Unlike the "featured" concept (which requires an admin-set flag and is
 * currently empty), this always returns real active products so the home page
 * never shows an empty showcase. Selection prefers products that have a
 * photograph, then most recently updated — no popularity/sales claims, no
 * changes to any featured flags.
 */
export const getHomeShowcaseProducts = unstable_cache(
  async (limit = 8): Promise<PublicProductSummary[]> => {
    const products = await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    // Products with a photo first, then the rest preserve their recency order.
    return products
      .map(toProductSummary)
      .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
  },
  ["public-home-products"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

export const getPublicProductBySlug = unstable_cache(
  async (slug: string): Promise<PublicProductDetail | null> => {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    if (!product || !product.isActive) return null;

    const images: PublicProductImage[] = product.images
      .filter((image) => isUsableImageUrl(image.url))
      .map((image, index) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        isPrimary: index === 0,
      }));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      productCode: product.productCode,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      subcategoryName: product.subcategory?.name ?? null,
      subcategorySlug: product.subcategory?.slug ?? null,
      shortDescription: product.shortDescription,
      description: product.description,
      features: product.features,
      specifications: toSpecifications(product.specifications),
      variants: toVariants(product.variants),
      availability: product.availability,
      featured: product.featured,
      images,
      primaryImage: images[0] ?? null,
    };
  },
  ["public-product"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<PublicProductSummary[]> => {
    const products = await db.product.findMany({
      where: { isActive: true, featured: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      productCode: product.productCode,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      subcategoryName: product.subcategory?.name ?? null,
      subcategorySlug: product.subcategory?.slug ?? null,
      shortDescription: product.shortDescription,
      availability: product.availability,
      featured: true,
      image:
        product.images.length > 0 && isUsableImageUrl(product.images[0].url)
          ? {
              url: cardImageUrl(product.images[0].url),
              alt: product.images[0].alt,
            }
          : null,
    }));
  },
  ["public-featured-products"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

/**
 * Lightweight options list for the public inquiry (request-a-quote) form.
 * Includes every public product's category, code and a small card image so the
 * form can offer an accessible native `<select>` grouped by category without
 * shipping thousands of kilobytes to the client.
 */
export const getPublicProductOptions = unstable_cache(
  async (): Promise<PublicProductOption[]> => {
    const products = await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
      take: 1000,
      select: {
        id: true,
        name: true,
        slug: true,
        productCode: true,
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: { url: true },
        },
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      productCode: product.productCode,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      imageUrl:
        product.images.length > 0 && isUsableImageUrl(product.images[0].url)
          ? cardImageUrl(product.images[0].url)
          : null,
    }));
  },
  ["public-product-options"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

// ---------------------------------------------------------------------------
// Structured data normalization (mirrors the admin detail mapper)
// ---------------------------------------------------------------------------

function toSpecifications(value: unknown): Record<string, string> | null {
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
    .map((item) => toSpecifications(item) ?? {});
}

/**
 * Optimized URLs for the detail page gallery.
 *
 * - hero: up to ~1080px wide, keeps the original proportions (no crop).
 * - thumb: small square crop for the thumbnail strip.
 */
export function heroImageUrl(url: string): string {
  return productImageHero(url, 1080);
}

export function galleryThumbUrl(url: string): string {
  return productImageThumb(url, 200);
}