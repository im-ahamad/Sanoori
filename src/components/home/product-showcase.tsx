import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { getHomeShowcaseProductsByCategory, getHomeCategoryBlocks } from "@/lib/public/catalogue";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Home page product catalogue preview — premium 4×3 grid system.
 *
 * Structure (desktop lg: 1024px+):
 * 1. SectionHeader - existing intro (eyebrow, title, description)
 * 2. Three category sections (H3 + 4×3 product grid in pink catalogue box)
 *    - Sanitary Ware
 *    - Tiles
 *    - Building Materials
 *
 * Mobile/Tablet: preserves original category-block behavior exactly
 */
export async function ProductShowcase() {
  const lang = await getLang();
  const [categoryGroups, categoryBlocks] = await Promise.all([
    getHomeShowcaseProductsByCategory(12), // 4 cols × 3 rows = 12 products per category
    getHomeCategoryBlocks(5), // 5 products per shelf for mobile
  ]);
  const t = getServerTranslations(lang);

  // Category order and display names from translations
  const categoryOrder = ["sanitary-ware", "tiles", "building-materials"] as const;
  const categoryLabels: Record<string, string> = {
    "sanitary-ware": t.categories["sanitary-ware"] ?? "Sanitary Ware",
    tiles: t.categories.tiles ?? "Tiles",
    "building-materials": t.categories["building-materials"] ?? "Building Materials",
  };

  // Filter and order groups to match the three main categories
  const orderedGroups = categoryOrder
    .map((slug) => categoryGroups.find((g) => g.category.slug === slug))
    .filter((g): g is (typeof categoryGroups)[0] => g !== undefined);

  // For mobile: order categoryBlocks the same way
  const orderedBlocks = categoryOrder
    .map((slug) => categoryBlocks.find((b) => b.category.slug === slug))
    .filter((b): b is (typeof categoryBlocks)[0] => b !== undefined);

  return (
    <section className="section-spacing bg-background" aria-labelledby="product-showcase-heading">
      <Container>
        {/* SECTION INTRO - Keep exactly as is */}
        <Reveal>
          <div id="product-showcase-heading">
            <SectionHeader
              eyebrow={t.productShowcase.eyebrow}
              title={t.productShowcase.title}
              description={t.productShowcase.description}
              align="left"
            />
          </div>
        </Reveal>

        {/* THREE CATEGORY SECTIONS - Desktop only */}
        <div className="hidden lg:block mt-8 lg:mt-10 space-y-6 lg:space-y-8">
          {orderedGroups.map((group, groupIndex) => (
            <Reveal key={group.category.id} delay={groupIndex * 0.1} className="space-y-2.5">
              {/* Category Heading */}
              <h3 className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
                {categoryLabels[group.category.slug] ?? group.category.name}
              </h3>

              {/* 4×3 Product Grid - continuous subtle grid lines, edge-to-edge */}
              <div className="grid gap-0 grid-cols-4 border border-[oklch(0.88_0.015_15)] dark:border-[oklch(0.30_0.02_15)] bg-white/80 dark:bg-[oklch(0.17_0.015_15)] rounded-xl overflow-hidden">
                {group.products.slice(0, 12).map((product, productIndex) => (
                  <Reveal key={product.id} delay={productIndex * 0.02}>
                    <ProductGridCell product={product} />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        {/* MOBILE/TABLET: Preserve existing behavior exactly */}
        <div className="lg:hidden mt-10 space-y-12">
          {orderedBlocks.map((block, groupIndex) => {
            const categorySlug = block.category.slug;
            const CATEGORY_BACKGROUNDS: Record<string, string> = {
              "sanitary-ware": "bg-[oklch(0.985_0.008_15)] dark:bg-[oklch(0.18_0.015_15)]",
              tiles: "bg-[oklch(0.99_0.003_85)] dark:bg-[oklch(0.17_0.008_85)]",
              "building-materials": "bg-[oklch(0.98_0.005_60)] dark:bg-[oklch(0.175_0.01_60)]",
            };
            const backgroundClass = CATEGORY_BACKGROUNDS[categorySlug] ?? "bg-muted/30";
            const translatedCategoryName =
              categoryLabels[categorySlug] ?? block.category.name;

            return (
              <Reveal key={block.category.id} delay={groupIndex * 0.08} className={`${backgroundClass} rounded-xl p-6`}>
                <div className="mb-6 flex items-center gap-3">
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                    {translatedCategoryName}
                  </h3>
                  <span className="h-1 w-10 bg-gold/60 shrink-0" aria-hidden="true" />
                </div>
                <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {block.productShelf.map((product, productIndex) => (
                    <Reveal key={product.id} delay={productIndex * 0.03}>
                      <article className="group relative flex-shrink-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="block overflow-hidden bg-white border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gold/40 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`View ${product.name}`}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-muted p-3" aria-hidden="true">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element -- native img retained for responsive object-contain in padded container; Image fill would alter layout
                              <img
                                src={product.image.url}
                                alt={product.image.alt ?? product.name}
                                className="object-contain object-center w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-dark">
                                <span className="text-navy-light/50 text-center px-2" aria-hidden="true">
                                  {product.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            );
          })}

          {/* View All Products CTA for mobile/tablet */}
          <Reveal className="mt-6">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t.productShowcase.seeFullCatalogue}
              </p>
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t.productShowcase.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

interface ProductGridCellProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image: { url: string; alt: string | null } | null;
  };
}

function ProductGridCell({ product }: ProductGridCellProps) {
  return (
    <article className="group relative flex-shrink-0">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden bg-[oklch(0.995_0.003_15)] dark:bg-[oklch(0.16_0.01_15)] transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] hover:border-[oklch(0.72_0.15_80)]/40 motion-reduce:transition-none motion-reduce:hover:shadow-none motion-reduce:hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.name}`}
      >
        {/* Image container - minimal padding so images reach grid boundaries */}
        <div className="relative aspect-square overflow-hidden bg-[oklch(0.985_0.004_15)] dark:bg-[oklch(0.17_0.01_15)] p-1" aria-hidden="true">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- native img retained for responsive object-contain in padded container; Image fill would alter layout
            <img
              src={product.image.url}
              alt={product.image.alt ?? product.name}
              className="object-contain object-center w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy/5 via-transparent to-navy/5">
              <span className="text-navy-light/40 text-center px-3 text-sm leading-snug" aria-hidden="true">
                {product.name}
              </span>
            </div>
          )}

          {/* Subtle warm overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
        </div>

        {/* Product name - subtle, appears on hover only */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-xs font-medium text-white truncate">{product.name}</p>
        </div>
      </Link>
    </article>
  );
}