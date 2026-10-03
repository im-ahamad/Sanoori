import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowRight } from "lucide-react";
import { SubcategoryCard } from "@/components/products/subcategory-card";
import { ProductShelf } from "@/components/products/product-shelf";
import type { CategoryBlockData } from "@/lib/public/catalogue";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

interface CategoryBlockProps {
  data: CategoryBlockData;
  index: number; // 0, 1, 2 for alternating layout
}

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  "sanitary-ware": "bg-[oklch(0.985_0.008_15)] dark:bg-[oklch(0.18_0.015_15)]",
  tiles: "bg-[oklch(0.99_0.003_85)] dark:bg-[oklch(0.17_0.008_85)]",
  "building-materials": "bg-[oklch(0.98_0.005_60)] dark:bg-[oklch(0.175_0.01_60)]",
};

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Category block with alternating layout:
 * - Even index (0, 2): Subcategories LEFT, Products RIGHT
 * - Odd index (1): Products LEFT, Subcategories RIGHT
 * 
 * Adapts to available subcategory data:
 * - Sanitary Ware: 5 non-empty subcategories → normal alternating layout (5/12 + 7/12)
 * - Tiles: 1 subcategory (Other Tiles) → compact subcat column (4/12), wider product shelf (8/12)
 * - Building Materials: 0 subcategories → product shelf takes full width, no empty state
 * 
 * Desktop only (lg: 1024px+). Below lg, stacks vertically.
 */
export async function CategoryBlock({ data, index }: CategoryBlockProps) {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const categorySlug = data.category.slug;
  const backgroundClass = CATEGORY_BACKGROUNDS[categorySlug] ?? "bg-muted/30";
  const translatedCategoryName =
    t.categories[categorySlug as keyof typeof t.categories] ?? data.category.name;

  // Alternating layout: even = subcats left, products right; odd = products left, subcats right
  const subcatsFirst = index % 2 === 0;
  const hasSubcategories = data.subcategories.length > 0;
  const isSingleSubcategory = data.subcategories.length === 1;

  // For single subcategory (Tiles): use 4/12 + 8/12 instead of 5/12 + 7/12
  // For normal (5 subcats): use 5/12 + 7/12
  // For no subcats: full width (12/12)
  const subcatColSpan = isSingleSubcategory ? 4 : 5;
  const productColSpan = isSingleSubcategory ? 8 : 7;

  return (
    <section className={`${backgroundClass} py-10 lg:py-14`} aria-labelledby={`${categorySlug}-heading`}>
      <Container>
        <Reveal delay={index * 0.1}>
          {/* Category Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2
                  id={`${categorySlug}-heading`}
                  className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-foreground"
                >
                  {translatedCategoryName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.totalProductCount} {t.products.products}
                  {hasSubcategories && (
                    <> · {data.subcategories.length} {data.subcategories.length === 1 ? "subcategory" : "subcategories"}</>
                  )}
                </p>
              </div>
              <ButtonLink
                href={`/products?category=${categorySlug}`}
                variant="outline"
                size="md"
                className="hidden lg:inline-flex"
              >
                {t.productShowcase.cta}
                <ArrowRight className="size-4 ml-1" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          {/* Content Grid: Subcategories + Product Shelf */}
          {hasSubcategories ? (
            // Alternating layout when subcategories exist
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
              {/* Subcategories Column */}
              <div
                className={cn(
                  "space-y-6",
                  subcatsFirst
                    ? `lg:col-span-${subcatColSpan}`
                    : `lg:col-span-${subcatColSpan} lg:col-start-${13 - subcatColSpan}`
                )}
              >
                <Reveal delay={0.1}>
                  <h3 className="font-heading text-lg font-medium text-foreground mb-4 lg:mb-5">
                    {t.categoryGrid.eyebrow} {translatedCategoryName}
                  </h3>
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {data.subcategories.map((item, subIndex) => (
                      <Reveal key={item.subcategory.id} delay={subIndex * 0.05}>
                        <SubcategoryCard
                          subcategory={item.subcategory}
                          productCount={item.productCount}
                          representativeImage={item.representativeImage}
                          categorySlug={categorySlug}
                          translatedName={t.categories[item.subcategory.slug as keyof typeof t.categories] ?? item.subcategory.name}
                        />
                      </Reveal>
                    ))}
                  </div>
                </Reveal>

                {/* Mobile/Tablet "View all" button */}
                <ButtonLink
                  href={`/products?category=${categorySlug}`}
                  variant="primary"
                  size="md"
                  className="lg:hidden w-full justify-center"
                >
                  {t.productShowcase.cta}
                  <ArrowRight className="size-4 ml-1" aria-hidden="true" />
                </ButtonLink>
              </div>

              {/* Product Shelf Column */}
              <div
                className={cn(
                  "space-y-6",
                  subcatsFirst
                    ? `lg:col-span-${productColSpan} lg:col-start-${subcatColSpan + 1}`
                    : `lg:col-span-${productColSpan}`
                )}
              >
                <Reveal delay={0.15}>
                  <h3 className="font-heading text-lg font-medium text-foreground mb-4 lg:mb-5">
                    {t.productShowcase.title.replace("A selection from our catalogue", "Featured products")}
                  </h3>
                  {data.productShelf.length > 0 ? (
                    <ProductShelf products={data.productShelf} categorySlug={categorySlug} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No products available to display.</p>
                    </div>
                  )}
                </Reveal>
              </div>
            </div>
          ) : (
            // No subcategories (Building Materials): product shelf takes full width
            <Reveal delay={0.15}>
              <h3 className="font-heading text-lg font-medium text-foreground mb-4 lg:mb-5">
                {t.productShowcase.title.replace("A selection from our catalogue", "Featured products")}
              </h3>
              {data.productShelf.length > 0 ? (
                <ProductShelf products={data.productShelf} categorySlug={categorySlug} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No products available to display.</p>
                </div>
              )}
            </Reveal>
          )}
        </Reveal>
      </Container>
    </section>
  );
}