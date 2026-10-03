import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Availability } from "@/generated/prisma";
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
  /** Total active product count in this category (optional, for catalogue preview) */
  _count?: {
    products: number;
  };
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
  availability: Availability;
  featured: boolean;
  image: PublicProductCardImage | null;
  madeIn: string | null;
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
  description: string | null;
  features: string[];
  specifications: string[];
  madeIn: string | null;
  availability: Availability;
  featured: boolean;
  images: PublicProductImage[];
  primaryImage: PublicProductImage | null;
  material: string | null;
  size: string | null;
  colorFinish: string | null;
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
  pageSize?: number;
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
  availability: Availability;
  featured: boolean;
  category: { name: string; slug: string };
  subcategory: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
  madeIn: string | null;
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
    availability: product.availability,
    featured: product.featured,
    image:
      product.images.length > 0 && isUsableImageUrl(product.images[0].url)
        ? {
            url: cardImageUrl(product.images[0].url),
            alt: product.images[0].alt,
          }
        : null,
    madeIn: product.madeIn,
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
        _count: {
          select: { products: { where: { isActive: true } } },
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
      _count: category._count,
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
    const pageSize = filters.pageSize ?? PUBLIC_PRODUCTS_PAGE_SIZE;
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
      showOnProducts: true,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { slug: { contains: q, mode: "insensitive" as const } },
                { productCode: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
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
 * Fetches a larger set of products for the main Products page showcase (8×8 = 64 products).
 * Uses the same filtering logic as getPublicProducts but with a larger page size.
 */
export const getPublicProductsShowcase = unstable_cache(
  async (
    filters: PublicProductFilters,
    limit = 64
  ): Promise<PublicProductSummary[]> => {
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
      showOnProducts: true,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { slug: { contains: q, mode: "insensitive" as const } },
                { productCode: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
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

    const products = await db.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    return products
      .map(toProductSummary)
      .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
  },
  ["public-products-showcase"],
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
      where: { isActive: true, showOnHome: true },
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

/**
 * Products grouped by category for the home page category-based showroom.
 *
 * Fetches all active categories (ordered by displayOrder) and for each category
 * returns a curated selection of products (preferring those with images, then
 * most recently updated). This powers the Amazon-style category showroom on
 * the home page.
 */
export interface CategoryProductGroup {
  category: PublicCategory;
  products: PublicProductSummary[];
  totalCount: number;
}

export const getHomeShowcaseProductsByCategory = unstable_cache(
  async (productsPerCategory = 12): Promise<CategoryProductGroup[]> => {
    const categories = await getPublicCategories();

    const groups = await Promise.all(
      categories.map(async (category) => {
        const products = await db.product.findMany({
          where: { isActive: true, showOnHome: true, categoryId: category.id },
          orderBy: [{ updatedAt: "desc" }],
          take: productsPerCategory,
          include: {
            category: { select: { name: true, slug: true } },
            subcategory: { select: { name: true, slug: true } },
            images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
          },
        });

        const totalCount = await db.product.count({
          where: { isActive: true, showOnHome: true, categoryId: category.id },
        });

        const summaries = products
          .map(toProductSummary)
          .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));

        return {
          category,
          products: summaries,
          totalCount,
        };
      })
    );

    // Filter out categories with no products
    return groups.filter((g) => g.products.length > 0);
  },
  ["public-home-products-by-category"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

/**
 * Category block data for the redesigned home page catalogue preview.
 * Includes subcategories with representative product images and a product shelf.
 */
export interface CategoryBlockData {
  category: PublicCategory;
  subcategories: Array<{
    subcategory: PublicSubcategory;
    productCount: number;
    representativeImage: PublicProductCardImage | null;
  }>;
  productShelf: PublicProductSummary[];
  totalProductCount: number;
}

/**
 * Selects a diversified product shelf for a category.
 * Prefers 1 product from each non-empty subcategory, then fills remaining
 * slots with featured/updatedAt ordering.
 */
async function selectDiversifiedProductShelf(
  categoryId: string,
  productsPerShelf: number,
  subcategoriesWithProducts: Array<{ subcategory: PublicSubcategory; productCount: number }>
): Promise<PublicProductSummary[]> {
  // If no subcategories with products, fall back to simple featured/recency order
  if (subcategoriesWithProducts.length === 0) {
    const fallbackProducts = await db.product.findMany({
      where: { isActive: true, showOnHome: true, categoryId },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: productsPerShelf,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });
    return fallbackProducts
      .map(toProductSummary)
      .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0))
      .slice(0, productsPerShelf);
  }

  const selectedProductIds = new Set<string>();
  const diversifiedShelf: PublicProductSummary[] = [];

  // Phase 1: Pick 1 product from each non-empty subcategory (respecting existing order)
  for (const { subcategory } of subcategoriesWithProducts) {
    if (diversifiedShelf.length >= productsPerShelf) break;

    const product = await db.product.findFirst({
      where: {
        isActive: true,
        showOnHome: true,
        categoryId,
        subcategoryId: subcategory.id,
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    if (product && !selectedProductIds.has(product.id)) {
      const summary = toProductSummary(product);
      diversifiedShelf.push(summary);
      selectedProductIds.add(product.id);
    }
  }

  // Phase 2: Fill remaining slots with featured/recency order (excluding already selected)
  if (diversifiedShelf.length < productsPerShelf) {
    const remainingNeeded = productsPerShelf - diversifiedShelf.length;
    const fallbackProducts = await db.product.findMany({
      where: {
        isActive: true,
        showOnHome: true,
        categoryId,
        id: { notIn: Array.from(selectedProductIds) },
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: remainingNeeded,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    const fallbackSummaries = fallbackProducts
      .map(toProductSummary)
      .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));

    diversifiedShelf.push(...fallbackSummaries);
  }

  return diversifiedShelf.slice(0, productsPerShelf);
}

/**
 * Fetches complete category block data for the home page redesign.
 * Each block contains subcategories with representative images and a product shelf.
 */
export const getHomeCategoryBlocks = unstable_cache(
  async (productsPerShelf = 5): Promise<CategoryBlockData[]> => {
    const categories = await getPublicCategories();

    const blocks = await Promise.all(
      categories.map(async (category) => {
        // Get subcategories with product counts and representative images
        const subcategoriesWithData = await Promise.all(
          category.subcategories.map(async (subcategory) => {
            const products = await db.product.findMany({
              where: { isActive: true, showOnHome: true, subcategoryId: subcategory.id },
              orderBy: [{ updatedAt: "desc" }],
              take: 1,
              include: {
                images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
              },
            });

            const productCount = await db.product.count({
              where: { isActive: true, showOnHome: true, subcategoryId: subcategory.id },
            });

            const representativeImage =
              products.length > 0 &&
              products[0].images.length > 0 &&
              isUsableImageUrl(products[0].images[0].url)
                ? {
                    url: cardImageUrl(products[0].images[0].url),
                    alt: products[0].images[0].alt,
                  }
                : null;

            return {
              subcategory,
              productCount,
              representativeImage,
            };
          })
        );

        // Filter subcategories that have products
        const subcategoriesWithProducts = subcategoriesWithData.filter(
          (s) => s.productCount > 0
        );

        // Get diversified product shelf
        const productShelf = await selectDiversifiedProductShelf(
          category.id,
          productsPerShelf,
          subcategoriesWithProducts
        );

        const totalProductCount = await db.product.count({
          where: { isActive: true, showOnHome: true, categoryId: category.id },
        });

        return {
          category,
          subcategories: subcategoriesWithProducts,
          productShelf,
          totalProductCount,
        };
      })
    );

    // Filter out categories with no products
    return blocks.filter((b) => b.totalProductCount > 0);
  },
  ["public-home-category-blocks"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

/**
 * Gets total product count across all categories for the closing catalogue card.
 */
export const getTotalActiveProductCount = unstable_cache(
  async (): Promise<number> => {
    return db.product.count({ where: { isActive: true } });
  },
  ["public-total-product-count"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

export const getPublicProductBySlug = unstable_cache(
  async (slug: string): Promise<PublicProductDetail | null> => {
    const product = await db.product.findUnique({
      where: { slug, isActive: true, showOnProducts: true },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    if (!product) return null;

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
      description: product.description,
      features: product.features,
      specifications: product.specifications,
      madeIn: product.madeIn,
      availability: product.availability,
      featured: product.featured,
      images,
      primaryImage: images[0] ?? null,
      material: product.material,
      size: product.size,
      colorFinish: product.colorFinish,
    };
  },
  ["public-product"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<PublicProductSummary[]> => {
    const products = await db.product.findMany({
      where: { isActive: true, showOnProducts: true, featured: true },
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
      availability: product.availability,
      featured: true,
      image:
        product.images.length > 0 && isUsableImageUrl(product.images[0].url)
          ? {
              url: cardImageUrl(product.images[0].url),
              alt: product.images[0].alt,
            }
          : null,
      madeIn: product.madeIn,
    }));
  },
  ["public-featured-products"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 }
);

/**
 * Fetches up to 4 related products for a given product.
 *
 * Preference order:
 * 1. Same category + same subcategory (if current product has a subcategory)
 * 2. Same category (any subcategory or no subcategory)
 *
 * Always excludes the current product, requires isActive=true and showOnProducts=true.
 * Orders by featured desc, then updatedAt desc.
 */
export const getRelatedProducts = unstable_cache(
  async (
    categorySlug: string,
    subcategorySlug: string | null,
    excludeProductId: string,
    limit = 4
  ): Promise<PublicProductSummary[]> => {
    // Phase 1: Try to get products from the same subcategory
    let relatedProducts: PublicProductSummary[] = [];

    if (subcategorySlug) {
      const sameSubcategoryProducts = await db.product.findMany({
        where: {
          isActive: true,
          showOnProducts: true,
          category: { slug: categorySlug },
          subcategory: { slug: subcategorySlug },
          id: { not: excludeProductId },
        },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      });

      relatedProducts = sameSubcategoryProducts.map(toProductSummary);
    }

    // Phase 2: If we need more products, fill from same category (excluding already selected)
    if (relatedProducts.length < limit) {
      const remainingNeeded = limit - relatedProducts.length;
      const excludeIds = [excludeProductId, ...relatedProducts.map((p) => p.id)];

      const sameCategoryProducts = await db.product.findMany({
        where: {
          isActive: true,
          showOnProducts: true,
          category: { slug: categorySlug },
          id: { notIn: excludeIds },
        },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: remainingNeeded,
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      });

      const additionalProducts = sameCategoryProducts.map(toProductSummary);
      relatedProducts.push(...additionalProducts);
    }

    return relatedProducts.slice(0, limit);
  },
  ["public-related-products"],
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
// Optimized URLs for the detail page gallery.
// ---------------------------------------------------------------------------

export function heroImageUrl(url: string): string {
  return productImageHero(url, 1080);
}

export function galleryThumbUrl(url: string): string {
  return productImageThumb(url, 200);
}