import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import {
  CatalogueFilters,
  type CatalogueFilterValues,
} from "@/components/products/catalogue-filters";
import { Pagination } from "@/components/products/pagination";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import {
  getPublicCategories,
  getPublicProducts,
  getFeaturedProducts,
  type PublicCategory,
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
    <main className="flex-1">
      <PageHeader
        title={t.products.heroTitle}
        description={t.products.heroDescription}
        breadcrumbs={[{ label: t.products.breadcrumb, href: "/products" }]}
        breadcrumbLinkClassName="text-[1rem] transition-colors duration-200 hover:text-gold-light"
        backgroundImage={
          categorySlug
            ? CATEGORY_HERO_IMAGES[categorySlug]
            : "/images/product-hero.png"
        }
        backdropOverlay={
          categorySlug === "sanitary-ware" || categorySlug === "tiles" || categorySlug === "building-materials"
            ? "bg-[radial-gradient(ellipse_115%_95%_at_50%_28%,color-mix(in_oklab,var(--navy-dark)_72%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_42%,transparent)_42%,transparent_88%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_76%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_42%,transparent)_45%,color-mix(in_oklab,var(--navy-dark)_8%,transparent)_70%,transparent_82%,transparent_100%)]"
            : categorySlug
            ? "bg-[radial-gradient(ellipse_115%_95%_at_50%_28%,color-mix(in_oklab,var(--navy-dark)_78%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_48%,transparent)_42%,transparent_85%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_82%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_40%,color-mix(in_oklab,var(--navy-dark)_12%,transparent)_78%,transparent_100%)]"
            : "bg-[radial-gradient(ellipse_115%_70%_at_50%_-12%,color-mix(in_oklab,var(--navy-dark)_62%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_44%,transparent)_30%,transparent_68%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_84%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_64%,transparent)_18%,color-mix(in_oklab,var(--navy-dark)_34%,transparent)_42%,color-mix(in_oklab,var(--navy-dark)_10%,transparent)_68%,transparent_84%,transparent_100%)]"
        }
        objectFit="object-cover"
        objectPosition={
          categorySlug ? "object-center" : "object-[50%_0%]"
        }
        noZoom={!categorySlug}
        textColor={categorySlug ? "white" : "pureWhite"}
        exactCenter
        className={
          categorySlug ? "pb-24 lg:pb-28" : "lg:min-h-[calc(100dvh-5rem)] pb-[4px]"
        }
      />

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
    getPublicProducts({ ...filters, page }),
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
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Catalogue results" className="mt-12">
        {catalogue.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-8">
              {catalogue.items.map((product) => (
                <ProductCard key={product.id} product={product} />
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
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
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