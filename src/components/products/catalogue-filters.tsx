import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import type { PublicCategory } from "@/lib/public/catalogue";
import { Availability } from "@/generated/prisma";
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
    <div className="rounded-lg border border-border bg-card p-3 md:p-5">
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Category navigation */}
        <div>
          {/* MOBILE (<768px): compact heading so the whole block eats less
              vertical space. `md:` restores the approved tablet/desktop size. */}
          <h2 className="flex items-center gap-1.5 font-heading text-[13px] md:text-sm font-semibold uppercase tracking-wider text-foreground">
            <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
            {t.products.browseByCategory}
          </h2>
          <nav aria-label="Product categories" className="mt-2 md:mt-3">
            <ul className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
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
              className="mt-2 md:mt-3 border-t border-border pt-2 md:pt-3"
            >
              <ul className="flex flex-wrap gap-1.5 md:gap-2">
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
        <form action="/products" method="get" className="space-y-2.5 md:space-y-3">
          <input type="hidden" name="category" value={values.categorySlug ?? ""} />
          <input
            type="hidden"
            name="subcategory"
            value={values.subcategorySlug ?? ""}
          />
          <label
            htmlFor="catalogue-search"
            className="font-heading text-[13px] md:text-sm font-semibold text-foreground"
          >
            {t.products.searchProducts}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search
                className="pointer-events-none absolute left-3 md:left-3.5 top-1/2 size-4 md:size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="catalogue-search"
                type="search"
                name="q"
                defaultValue={values.q ?? ""}
                placeholder={t.products.searchPlaceholder}
                className="h-10 md:h-12 w-full rounded-md border border-input bg-background pl-9 md:pl-10 pr-3 md:pr-4 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            <button
              type="submit"
              className="h-10 md:h-12 rounded-md bg-primary px-3 md:px-6 text-sm md:text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap"
            >
              {t.products.searchButton}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="catalogue-availability"
                className="font-heading text-[13px] md:text-sm font-semibold text-foreground"
              >
                {t.products.availabilityLabel}
              </label>
              <select
                id="catalogue-availability"
                name="availability"
                defaultValue={values.availability ?? ""}
                className="mt-1 h-10 md:h-12 w-full rounded-md border border-input bg-background px-3 md:px-4 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
            <div className="flex items-center">
              <label className="flex h-10 md:h-12 w-full items-center gap-2 md:gap-2.5 text-sm font-medium text-foreground lg:w-auto">
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={Boolean(values.featured)}
                  className="size-4 rounded border-input accent-primary"
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
      /* MOBILE (<768px): 40px tall + tighter padding keeps the chips compact
         while staying a comfortable tap target. `md:` keeps the approved
         48px desktop/tablet chip untouched. Labels are never truncated. */
      className={cn(
        "inline-flex h-10 md:h-12 items-center justify-center rounded-full border px-3 md:px-4 font-medium transition-colors duration-200 text-[13px] md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary text-primary-foreground hover:text-gold"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:text-gold-text"
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
      /* MOBILE (<768px): tighter padding/type; height stays 36px so the
         secondary chips remain easy to tap. `md:` restores desktop values. */
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-3 md:px-4 text-[13px] md:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-gold bg-gold/15 font-medium text-navy-dark"
          : "border-border bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}