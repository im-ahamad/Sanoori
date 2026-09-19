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
import { Availability } from "@/generated/prisma/enums";

export const metadata = generatePageMetadata({
  title: "Products",
  description:
    "Browse the Sanoori Trading catalogue — sanitary ware, tiles, and building materials. Search, filter, and order on WhatsApp.",
  path: "/products",
});

const AVAILABILITY_VALUES = [
  Availability.IN_STOCK,
  Availability.ON_REQUEST,
  Availability.OUT_OF_STOCK,
] as const;

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
    generateBreadcrumbSchema([{ name: "Products", url: "/products" }])
  );

  // Categories are needed for the filter bar before the (~streamed) results.
  const categories = await getPublicCategories();

  return (
    <main className="flex-1">
      <PageHeader
        title="Products"
        description="Search our catalogue or browse by category. Availability is confirmed when you message us."
        breadcrumbs={[{ label: "Products", href: "/products" }]}
      />

      <Container>
        <div className="section-spacing">
          <Suspense fallback={<CatalogueSkeleton />}>
            <CatalogueView
              filters={filters}
              categories={categories}
              page={page}
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
}: {
  filters: CatalogueFilterValues;
  categories: PublicCategory[];
  page: number;
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
      <CatalogueFilters categories={categories} values={filters} />

      {showFeaturedSection && (
        <section aria-labelledby="featured-heading" className="mt-12">
          <SectionHeader
            title="Featured products"
            description="Highlights from our current range."
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
        {catalogue.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
              />
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border py-16">
            <EmptyState
              title="No products found"
              description={
                hasActiveFilters
                  ? "Nothing matches your current search and filters. Try a different term or clear some filters."
                  : "Products will appear here as we add them. Tell us what you need and we will source it for you."
              }
              icon={<PackageSearch className="size-8 text-muted-foreground" />}
            />
            <div className="flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-center">
              {hasActiveFilters && (
                <ButtonLink href="/products" variant="outline">
                  Clear all filters
                </ButtonLink>
              )}
              <ButtonLink href="/request-quote">
                Request a Quote
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function CatalogueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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