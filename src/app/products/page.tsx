import { Suspense } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { cn } from "@/lib/utils";
import {
  CatalogueFilters,
  type CatalogueFilterValues,
} from "@/components/products/catalogue-filters";
import { Pagination } from "@/components/products/pagination";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import {
  getPublicCategories,
  getPublicProducts,
  getPublicProductsShowcase,
  getFeaturedProducts,
  type PublicCategory,
  type PublicProductFilters,
} from "@/lib/public/catalogue";
import { Availability } from "@/generated/prisma";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata(): Promise<ReturnType<typeof generatePageMetadata>> {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  return generatePageMetadata({
    title: t.products.heroTitle,
    description: t.products.heroDescription,
    path: "/products",
  });
}

const AVAILABILITY_VALUES = [
  Availability.IN_STOCK,
  Availability.ON_REQUEST,
  Availability.OUT_OF_STOCK,
] as const;

const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "sanitary-ware": "/images/sanitary-hero.png",
  tiles: "/images/tiles-hero.png",
  "building-materials": "/images/building-hero.png",
};

function firstValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseAvailability(
  raw: string | undefined
): Availability | undefined {
  return AVAILABILITY_VALUES.find((value) => value === raw);
}

function isTruthy(raw: string | undefined): boolean {
  return raw === "true" || raw === "1" || raw === "yes";
}

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const params = await searchParams;

  const q = firstValue(params.q) || undefined;
  const categorySlug = firstValue(params.category) || undefined;
  const subcategorySlug = firstValue(params.subcategory) || undefined;
  const availability = parseAvailability(firstValue(params.availability));
  const featured = isTruthy(firstValue(params.featured));
  const page = Math.max(1, Math.floor(Number(firstValue(params.page)) || 1));

  const filters: CatalogueFilterValues = {
    q,
    categorySlug,
    subcategorySlug,
    availability,
    featured,
  };

  const breadcrumbSchema = JSON.stringify(
    generateBreadcrumbSchema([{ name: t.products.breadcrumb, url: "/products" }])
  );

  // Categories are needed for the filter bar before the (~streamed) results.
  const categories = await getPublicCategories();

  return (
    <main className="flex-1 relative">
      {/* Hero with text centered in left 35% of image */}
      <section
        className={cn(
          "relative overflow-hidden border-b border-white/10 bg-navy-dark text-white",
          categorySlug
            ? "min-h-[20rem] lg:min-h-[28rem] pb-24 lg:pb-28"
            : "min-h-[calc(100vw/3)] pb-[4px]"
        )}
        aria-labelledby="products-hero-heading"
      >
        <VisualBackdrop
          variant="header"
          src={
            categorySlug
              ? CATEGORY_HERO_IMAGES[categorySlug]
              : "/images/product-hero.png"
          }
          overlayClassName={
            categorySlug === "sanitary-ware" || categorySlug === "tiles" || categorySlug === "building-materials"
              ? "bg-[radial-gradient(ellipse_115%_95%_at_50%_28%,color-mix(in_oklab,var(--navy-dark)_36%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_21%,transparent)_42%,transparent_88%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_38%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_21%,transparent)_45%,color-mix(in_oklab,var(--navy-dark)_4%,transparent)_70%,transparent_82%,transparent_100%)]"
              : categorySlug
              ? "bg-[radial-gradient(ellipse_115%_95%_at_50%_28%,color-mix(in_oklab,var(--navy-dark)_78%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_48%,transparent)_42%,transparent_85%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_82%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_40%,color-mix(in_oklab,var(--navy-dark)_12%,transparent)_78%,transparent_100%)]"
              : "bg-[radial-gradient(ellipse_115%_70%_at_50%_-12%,color-mix(in_oklab,var(--navy-dark)_62%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_44%,transparent)_30%,transparent_68%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_84%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_64%,transparent)_18%,color-mix(in_oklab,var(--navy-dark)_34%,transparent)_42%,color-mix(in_oklab,var(--navy-dark)_10%,transparent)_68%,transparent_84%,transparent_100%)]"
          }
          objectFit="object-cover"
          objectPosition={categorySlug ? "object-center" : "object-[50%_0%]"}
          noZoom={!categorySlug}
          priority
        />

        {/* Hero text block - left 35% of hero from lg up, full width below lg */}
        <div
          className="absolute inset-0 flex items-center lg:w-[35%]"
          aria-hidden="true"
        >
          <div
            className={cn(
              "w-full flex flex-col items-center justify-center h-full px-6 text-center",
              categorySlug ? "-mt-[100px]" : "lg:-mt-[230px]"
            )}
          >
            <nav aria-label="Breadcrumb" className="mb-2">
              <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-white"
                  >
                    {t.common.home}
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  <span className="text-white">
                    {categorySlug === "sanitary-ware"
                      ? t.categories["sanitary-ware"]
                      : categorySlug === "tiles"
                      ? t.categories.tiles
                      : categorySlug === "building-materials"
                      ? t.categories["building-materials"]
                      : t.products.breadcrumb}
                  </span>
                </li>
              </ol>
            </nav>
            <h1
              id="products-hero-heading"
              className="font-heading font-bold tracking-tight text-white text-[clamp(1.875rem,5vw,3rem)] sm:text-[clamp(2.25rem,5vw,3.5rem)] lg:text-[clamp(3rem,5vw,4rem)]"
            >
              {categorySlug === "sanitary-ware"
                ? t.categories["sanitary-ware"]
                : categorySlug === "tiles"
                ? t.categories.tiles
                : categorySlug === "building-materials"
                ? t.categories["building-materials"]
                : t.products.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg text-white/80 whitespace-pre-wrap">
              {t.products.heroDescription}
            </p>
          </div>
        </div>
      </section>

      <Container>
        <div className="section-spacing">
          <Suspense fallback={<CatalogueSkeleton t={t} />}>
            <CatalogueView
              filters={filters}
              categories={categories}
              page={page}
              t={t}
            />
          </Suspense>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
    </main>
  );
}

/**
 * Server-rendered results area. Lives behind its own Suspense boundary so
 * `/products` streams a skeleton while the (cached) DB query resolves —
 * without wrapping `/products/[slug]`, which needs a real HTTP 404 for
 * missing products.
 */
async function CatalogueView({
  filters,
  categories,
  page,
  t,
}: {
  filters: CatalogueFilterValues;
  categories: PublicCategory[];
  page: number;
  t: ReturnType<typeof getServerTranslations>;
}) {
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.categorySlug ||
      filters.subcategorySlug ||
      filters.availability ||
      filters.featured
  );

  const [catalogue, featuredProducts] = await Promise.all([
    getPublicProducts({ ...filters, page, pageSize: (filters.categorySlug === "sanitary-ware" || filters.categorySlug === "tiles" || filters.categorySlug === "building-materials") ? 32 : undefined }),
    getFeaturedProducts(4),
  ]);

  const safePage = Math.min(page, catalogue.totalPages);
  const showFeaturedSection = !hasActiveFilters && featuredProducts.length > 0;

  const paginationQuery: Record<string, string> = {
    q: filters.q ?? "",
    category: filters.categorySlug ?? "",
    subcategory: filters.subcategorySlug ?? "",
    availability: filters.availability ?? "",
    featured: filters.featured ? "true" : "",
  };

  // For the default all products view (no active filters), fetch products in the specific category order:
  // Rows 1-2: Sanitary Ware (8 products)
  // Rows 3-4: Tiles (8 products)
  // Rows 5-6: Building Materials (8 products)
  // Rows 7-8: Sanitary Ware (8 products)
  // Rows 9-10: Building Materials (8 products)
  // Rows 11-12: Sanitary Ware (8 products)
  // Total: 48 products in 4 columns × 12 rows
  let allProducts: Awaited<ReturnType<typeof getPublicProductsShowcase>> = [];
  if (!hasActiveFilters) {
    const [sanitaryWareProducts, tilesProducts, buildingMaterialsProducts] = await Promise.all([
      getPublicProductsShowcase({ ...filters, categorySlug: "sanitary-ware" }, 24),
      getPublicProductsShowcase({ ...filters, categorySlug: "tiles" }, 8),
      getPublicProductsShowcase({ ...filters, categorySlug: "building-materials" }, 16),
    ]);

    // Arrange in the exact order:
    // First 8 Sanitary Ware (rows 1-2)
    // Next 8 Tiles (rows 3-4)
    // Next 8 Building Materials (rows 5-6)
    // Next 8 Sanitary Ware (rows 7-8)
    // Next 8 Building Materials (rows 9-10)
    // Last 8 Sanitary Ware (rows 11-12)
    const sanitaryWareFirst8 = sanitaryWareProducts.slice(0, 8);
    const sanitaryWareRows7_8 = sanitaryWareProducts.slice(8, 16);
    const sanitaryWareRows11_12 = sanitaryWareProducts.slice(16, 24);
    const buildingMaterialsRows5_6 = buildingMaterialsProducts.slice(0, 8);
    const buildingMaterialsRows9_10 = buildingMaterialsProducts.slice(8, 16);
    
    allProducts = [
      ...sanitaryWareFirst8,
      ...tilesProducts.slice(0, 8),
      ...buildingMaterialsRows5_6,
      ...sanitaryWareRows7_8,
      ...buildingMaterialsRows9_10,
      ...sanitaryWareRows11_12,
    ];
  }

  return (
    <>
      <CatalogueFilters categories={categories} values={filters} t={t} />

      {showFeaturedSection && (
        <section aria-labelledby="featured-heading" className="mt-12">
          <SectionHeader
            title={t.products.featuredProductsTitle}
            description={t.products.featuredProductsDescription}
            className="[&>h2]:text-xl sm:[&>h2]:text-2xl"
          />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Catalogue results" className="mt-12">
        {(!hasActiveFilters ? allProducts : catalogue.items).length > 0 ? (
          <>
            {!hasActiveFilters ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    hideAvailabilityBadge
                  />
                ))}
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 ${filters.categorySlug === "sanitary-ware" || filters.categorySlug === "tiles" || filters.categorySlug === "building-materials" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                  {catalogue.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      hideAvailabilityBadge
                    />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination
                    state={{
                      page: safePage,
                      totalPages: catalogue.totalPages,
                      total: catalogue.total,
                      queryParams: paginationQuery,
                    }}
                    t={t}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border py-16">
            <EmptyState
              title={t.products.noProductsTitle}
              description={
                hasActiveFilters
                  ? t.products.noProductsWithFilters
                  : t.products.noProductsEmpty
              }
              icon={<PackageSearch className="size-8 text-muted-foreground" />}
            />
            <div className="flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-center">
              {hasActiveFilters && (
                <ButtonLink href="/products" variant="outline">
                  {t.products.clearFilters}
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function CatalogueSkeleton({ t }: { t: ReturnType<typeof getServerTranslations> }) {
  return (
    <div aria-busy="true" aria-label={t.products.loadingProducts}>
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {Array.from({ length: 48 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}