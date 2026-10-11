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

const STYLES: Record<Availability, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  IN_STOCK: { variant: "default" },
  ON_REQUEST: { variant: "secondary" },
  OUT_OF_STOCK: { variant: "outline", className: "bg-border" },
};

const AVAILABILITY_KEYS: Record<Availability, string> = {
  IN_STOCK: "inStock",
  ON_REQUEST: "onRequest",
  OUT_OF_STOCK: "outOfStock",
};

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

  const heroHeading =
    categorySlug === "sanitary-ware"
      ? t.categories["sanitary-ware"]
      : categorySlug === "tiles"
      ? t.categories.tiles
      : categorySlug === "building-materials"
      ? t.categories["building-materials"]
      : t.products.heroTitle;

  // Mobile-only heading trim for Building Materials: the trailing word
  // ("Materials" / "ম্যাটেরিয়ালস") is wrapped so CSS can hide it below 768px,
  // leaving exactly "Building" / "বিল্ডিং". Above 768px the span renders
  // inline, so the heading text is byte-for-byte unchanged.
  const heroHeadingTail =
    categorySlug === "building-materials"
      ? heroHeading.lastIndexOf(" ")
      : -1;

  return (
    <main className="flex-1 relative">
      {/* Hero with text centered in left 35% of image */}
      <section
        className={cn(
          "relative overflow-hidden border-b border-white/10 bg-navy-dark text-white sanoori-products-hero",
          // Scope hooks for the mobile-only category hero treatment (full
          // natural-ratio image + top-left copy in globals.css); the slug
          // variant lets individual categories tweak their heading.
          categorySlug && categorySlug in CATEGORY_HERO_IMAGES
            ? `sanoori-products-hero--category sanoori-products-hero--${categorySlug}`
            : null,
          categorySlug
            ? "min-h-[20rem] lg:min-h-[28rem]"
            // Floor the hero so it can never be shorter than the 137px text block
            // (content 137 + 1px border + 2px slack). Below 420px `100vw/3` would
            // otherwise be < 138px and clip the breadcrumb into the header and cut
            // the description. At >=420px (and therefore all desktop widths) the
            // `max()` resolves to `calc(100vw/3)`, so nothing else changes.
            : "min-h-[max(calc(100vw/3),140px)] pb-[4px]"
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
          className="absolute inset-0 flex items-start lg:items-center lg:w-[35%] sanoori-products-hero-content"
          aria-hidden="true"
        >
          <div
            className={cn(
              // Desktop/laptop (lg+): restore the approved centered copy block
              // (axis + vertical centering + centred text). Without it the
              // fixed pull-up below pushes the whole block above the hero edge
              // and the breadcrumb/heading are clipped out of view. Below lg
              // the mobile/tablet top-left presentation is left untouched.
              "w-full flex flex-col items-start justify-start lg:items-center lg:justify-center lg:text-center h-full px-6 text-left",
              // The hero is aspect-ratio driven (`100vw/3`), so the block is
              // pulled up by a fixed 230px to sit in the top-left. On narrower
              // / short lg viewports that fixed pull-up outruns the shorter
              // hero and shoves the breadcrumb above the hero edge (hidden
              // behind the header). Cap the pull-up against the real hero
              // height so the block always keeps ~24px below the top edge;
              // at >=1440px (and every larger desktop) the cap resolves back
              // to exactly -230px, so the approved desktop is untouched.
              categorySlug
                ? "-mt-[100px]"
                : "lg:mt-[max(-230px,248px_-_100vw_/_3)]"
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
              {heroHeadingTail > 0 ? (
                <>
                  {heroHeading.slice(0, heroHeadingTail)}
                  <span className="sanoori-products-hero-heading-tail">
                    {heroHeading.slice(heroHeadingTail)}
                  </span>
                </>
              ) : (
                heroHeading
              )}
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

  // The three main category URLs (?category=sanitary-ware|tiles|building-materials)
  // get the dedicated catalogue grid treatment below: 3 cols × 10 rows on
  // mobile/tablet (30 products) and 4 cols × 8 rows on laptop/desktop
  // (32 products). Any other filter/search keeps the shared default grid.
  const isMainCategoryFilter =
    filters.categorySlug === "sanitary-ware" ||
    filters.categorySlug === "tiles" ||
    filters.categorySlug === "building-materials";

  const [catalogue, featuredProducts] = await Promise.all([
    getPublicProducts({ ...filters, page, pageSize: isMainCategoryFilter ? 32 : undefined }),
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

  // Default view (no active filters): group the existing products into the three
  // main category sections, mirroring the Home page catalogue. Category-specific
  // URLs (?category=...) keep using the flat filtered grid below.
  // Up to 24 products per category: 3 cols × 8 rows on mobile/tablet, 4 cols × 6
  // rows on laptop/desktop. Products flow in sequentially from the same category,
  // so a row is never left with empty cells while more of that category exist.
  const productsPerCategory = 24;
  type ShowcaseProduct = Awaited<ReturnType<typeof getPublicProductsShowcase>>[number];
  const defaultCategoryGroups: { slug: string; products: ShowcaseProduct[] }[] = [];
  if (!hasActiveFilters) {
    const [sanitaryWareProducts, tilesProducts, buildingMaterialsProducts] = await Promise.all([
      getPublicProductsShowcase({ ...filters, categorySlug: "sanitary-ware" }, productsPerCategory),
      getPublicProductsShowcase({ ...filters, categorySlug: "tiles" }, productsPerCategory),
      getPublicProductsShowcase({ ...filters, categorySlug: "building-materials" }, productsPerCategory),
    ]);

    defaultCategoryGroups.push(
      { slug: "sanitary-ware", products: sanitaryWareProducts },
      { slug: "tiles", products: tilesProducts },
      { slug: "building-materials", products: buildingMaterialsProducts }
    );
  }

  const defaultProductCount = defaultCategoryGroups.reduce(
    (count, group) => count + group.products.length,
    0
  );

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
          {/* Same responsive grid + card style as the Home catalogue */}
          <div className="mt-6 sanoori-products-grid">
            {featuredProducts.map((product) => {
              const availabilityStyle = STYLES[product.availability] ?? { variant: "outline" as const };
              const availabilityKey = AVAILABILITY_KEYS[product.availability];
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="catalogue"
                  categoryLabel={t.categories[product.categorySlug as keyof typeof t.categories] ?? product.categoryName}
                  askForPriceLabel={t.products.askForPrice}
                  viewDetailsLabel={t.products.viewDetails}
                  availabilityLabel={t.common[availabilityKey as keyof typeof t.common] ?? product.availability}
                  availabilityVariant={availabilityStyle.variant}
                />
              );
            })}
          </div>
        </section>
      )}

      <section
        aria-label="Catalogue results"
        className={cn("mt-12", !hasActiveFilters && "sanoori-products-catalogue")}
      >
        {(!hasActiveFilters ? defaultProductCount : catalogue.items.length) > 0 ? (
          <>
            {!hasActiveFilters ? (
              <div className="space-y-3">
                {defaultCategoryGroups
                  .filter((group) => group.products.length > 0)
                  .map((group) => (
                    <section
                      key={group.slug}
                      aria-labelledby={`products-category-${group.slug}`}
                      className="catalogue-category-container"
                    >
                      <h2
                        id={`products-category-${group.slug}`}
                        className="font-heading text-lg lg:text-xl font-semibold tracking-tight text-foreground px-4 py-3"
                      >
                        {t.categories[group.slug as keyof typeof t.categories] ?? group.slug}
                      </h2>
                      <div className="sanoori-products-grid sanoori-category-grid px-4 pb-4">
                        {group.products.map((product) => {
                          const availabilityStyle = STYLES[product.availability] ?? { variant: "outline" as const };
                          const availabilityKey = AVAILABILITY_KEYS[product.availability];
                          return (
                            <ProductCard
                              key={product.id}
                              product={product}
                              variant="catalogue"
                              hideAvailabilityBadge
                              categoryLabel={t.categories[product.categorySlug as keyof typeof t.categories] ?? product.categoryName}
                              askForPriceLabel={t.products.askForPrice}
                              viewDetailsLabel={t.products.viewDetails}
                              availabilityLabel={t.common[availabilityKey as keyof typeof t.common] ?? product.availability}
                              availabilityVariant={availabilityStyle.variant}
                            />
                          );
                        })}
                      </div>
                    </section>
                  ))}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "sanoori-products-grid",
                    isMainCategoryFilter && "sanoori-category-filtered-grid"
                  )}
                >
                  {catalogue.items.map((product) => {
                    const availabilityStyle = STYLES[product.availability] ?? { variant: "outline" as const };
                    const availabilityKey = AVAILABILITY_KEYS[product.availability];
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="catalogue"
                        hideAvailabilityBadge
                        categoryLabel={t.categories[product.categorySlug as keyof typeof t.categories] ?? product.categoryName}
                        askForPriceLabel={t.products.askForPrice}
                        viewDetailsLabel={t.products.viewDetails}
                        availabilityLabel={t.common[availabilityKey as keyof typeof t.common] ?? product.availability}
                        availabilityVariant={availabilityStyle.variant}
                      />
                    );
                  })}
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
                    hideSummary={isMainCategoryFilter}
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
      <div className="mt-12 sanoori-products-grid">
        {Array.from({ length: 48 }).map((_, index) => (
          <div key={index} className="catalogue-card">
            <Skeleton className="aspect-square w-full rounded-[8px]" />
            <Skeleton className="mt-1 h-4 w-3/4 rounded" />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}