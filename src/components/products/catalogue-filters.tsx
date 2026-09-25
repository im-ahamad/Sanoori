import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import type { PublicCategory } from "@/lib/public/catalogue";
import { Availability } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { getServerTranslations } from "@/lib/i18n/server-translations";

export interface CatalogueFilterValues {
  q?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  availability?: Availability;
  featured?: boolean;
}

/**
 * Builds a query string for the catalogue preserving the filters we want to
 * keep while clearing the ones the new link replaces. `page` is intentionally
 * dropped so changing any filter returns to page 1.
 */
function buildPath(
  values: CatalogueFilterValues,
  overrides: Partial<CatalogueFilterValues> = {}
): string {
  const next = { ...values, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.availability) params.set("availability", next.availability);
  if (next.featured) params.set("featured", "true");
  if (next.categorySlug) params.set("category", next.categorySlug);
  if (next.subcategorySlug) params.set("subcategory", next.subcategorySlug);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

const AVAILABILITY_OPTIONS = ["", "IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK"] as const;

export function CatalogueFilters({
  categories,
  values,
  t,
}: {
  categories: PublicCategory[];
  values: CatalogueFilterValues;
  t: ReturnType<typeof getServerTranslations>;
}) {
  const activeCategory = categories.find(
    (category) => category.slug === values.categorySlug
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Category navigation */}
        <div>
          <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
            <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
            {t.products.browseByCategory}
          </h2>
          <nav aria-label="Product categories" className="mt-3">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              <li>
                <CategoryChip
                  href={buildPath(values, {
                    categorySlug: undefined,
                    subcategorySlug: undefined,
                  })}
                  active={!values.categorySlug}
                >
                  {t.products.allProducts}
                </CategoryChip>
              </li>
              {categories.map((category) => {
                const translatedName = t.categories[category.slug as keyof typeof t.categories] ?? category.name;
                return (
                  <li key={category.id}>
                    <CategoryChip
                      href={buildPath(values, {
                        categorySlug: category.slug,
                        subcategorySlug: undefined,
                      })}
                      active={values.categorySlug === category.slug}
                    >
                      {translatedName}
                    </CategoryChip>
                  </li>
                );
              })}
            </ul>
          </nav>

          {activeCategory && activeCategory.subcategories.length > 0 && (
            <nav
              aria-label="Product types"
              className="mt-3 border-t border-border pt-3"
            >
              <ul className="flex flex-wrap gap-2">
                <li>
                  <SubcategoryChip
                    href={buildPath(values, { subcategorySlug: undefined })}
                    active={!values.subcategorySlug}
                  >
                    {t.products.allTypes}
                  </SubcategoryChip>
                </li>
                {activeCategory.subcategories.map((subcategory) => (
                  <li key={subcategory.id}>
                    <SubcategoryChip
                      href={buildPath(values, {
                        subcategorySlug: subcategory.slug,
                      })}
                      active={values.subcategorySlug === subcategory.slug}
                    >
                      {subcategory.name}
                    </SubcategoryChip>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Search + availability */}
        <form action="/products" method="get" className="space-y-3">
          <input type="hidden" name="category" value={values.categorySlug ?? ""} />
          <input
            type="hidden"
            name="subcategory"
            value={values.subcategorySlug ?? ""}
          />
          <label
            htmlFor="catalogue-search"
            className="font-heading text-sm font-semibold text-foreground"
          >
            {t.products.searchProducts}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="catalogue-search"
                type="search"
                name="q"
                defaultValue={values.q ?? ""}
                placeholder={t.products.searchPlaceholder}
                className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            <button
              type="submit"
              className="h-12 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t.products.searchButton}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="catalogue-availability"
                className="font-heading text-sm font-semibold text-foreground"
              >
                {t.products.availabilityLabel}
              </label>
              <select
                id="catalogue-availability"
                name="availability"
                defaultValue={values.availability ?? ""}
                className="mt-1 h-12 w-full rounded-md border border-input bg-background px-4 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">{t.products.anyAvailability}</option>
                {AVAILABILITY_OPTIONS.slice(1).map((value) => {
                  const keyMap: Record<string, keyof typeof t.products> = {
                    IN_STOCK: "inStock",
                    ON_REQUEST: "onRequest",
                    OUT_OF_STOCK: "outOfStock",
                  };
                  return (
                    <option key={value} value={value}>
                      {t.products[keyMap[value]]}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex h-12 items-center gap-2.5 text-base font-medium text-foreground">
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={Boolean(values.featured)}
                  className="size-5 rounded border-input accent-primary"
                />
                {t.products.featuredOnly}
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-full border px-6 font-medium transition-colors duration-200 text-[1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary text-primary-foreground hover:text-gold"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:text-gold"
      )}
    >
      {children}
    </Link>
  );
}

function SubcategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-5 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-gold bg-gold/15 font-medium text-navy-dark"
          : "border-border bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}