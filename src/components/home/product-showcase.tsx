import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { getHomeShowcaseProductsByCategory } from "@/lib/public/catalogue";
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
 * Home page product catalogue preview — premium card grid.
 *
 * Structure (desktop lg: 1024px+):
 * 1. SectionHeader - existing intro (eyebrow, title, description)
 * 2. Three category sections (H3 + 4×3 product grid)
 *    - Sanitary Ware
 *    - Tiles
 *    - Building Materials
 *
 * Mobile/Tablet: same three sections, same products, same order — rendered as a
 * compact 2-up grid instead of the 4-up desktop grid.
 *
 * DATA PARITY: desktop and mobile are fed from a single fetch
 * (`getHomeShowcaseProductsByCategory`) and map over the exact same
 * `group.products` array, so the product set, count and order are identical at
 * every viewport. Only the responsive grid markup differs.
 */
export async function ProductShowcase() {
  const lang = await getLang();
  // Single source of truth for BOTH desktop and mobile rendering.
  // 4 cols × 3 rows = 12 products per category on desktop.
  const categoryGroups = await getHomeShowcaseProductsByCategory(12);
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

              {/* 4×3 Product Grid - cards wrap tightly around images */}
              <div className="grid gap-4 lg:gap-5 grid-cols-2 sm:grid-cols-4 items-start">
                {group.products.slice(0, 12).map((product, productIndex) => (
                  <Reveal key={product.id} delay={productIndex * 0.02}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        {/* MOBILE/TABLET: same products, same order as the desktop grid above —
            only the responsive arrangement differs (compact 2-up on phones).
            `home-catalogue` scopes the mobile-only (≤768px) spacing rules in
            globals.css — tablet (769–1023px) keeps the utilities below. */}
        <div className="home-catalogue lg:hidden mt-10 space-y-12">
          {orderedGroups.map((group, groupIndex) => {
            const categorySlug = group.category.slug;
            const CATEGORY_BACKGROUNDS: Record<string, string> = {
              "sanitary-ware": "bg-[oklch(0.985_0.008_15)] dark:bg-accent",
              tiles: "bg-[oklch(0.99_0.003_85)] dark:bg-accent",
              "building-materials": "bg-[oklch(0.98_0.005_60)] dark:bg-accent",
            };
            const backgroundClass = CATEGORY_BACKGROUNDS[categorySlug] ?? "bg-muted/30";
            const translatedCategoryName =
              categoryLabels[categorySlug] ?? group.category.name;

            return (
              <Reveal
                key={group.category.id}
                delay={groupIndex * 0.08}
                className={`${backgroundClass} catalogue-section rounded-xl p-6`}
              >
                <div className="section-title mb-6 flex items-center gap-3">
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                    {translatedCategoryName}
                  </h3>
                  <span className="h-1 w-10 bg-gold/60 shrink-0" aria-hidden="true" />
                </div>
                <div className="products grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 items-start">
                  {/* Identical slice + order as the desktop grid → same product set */}
                  {group.products.slice(0, 12).map((product, productIndex) => (
                    <Reveal key={product.id} delay={productIndex * 0.03}>
                      <ProductCard product={product} />
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

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image: { url: string; alt: string | null } | null;
  };
}

/**
 * Product card — thin soft frame wrapping tightly around the image.
 * - Card: 4px padding, 18px radius, background #F5F6F4 (extremely light)
 * - Image: 14px radius, object-fit: contain, NO cropping, natural aspect ratio
 * - No visible border, no heavy shadow
 * - Name below card, left-aligned, 14px, #1A1A1A, normal weight, 6px gap
 */
function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="block group"
        aria-label={`View ${product.name}`}
      >
        {/* Card frame - thin soft frame wrapping the image */}
        <div
          className="relative overflow-hidden rounded-[18px] bg-[#F5F6F4] dark:bg-card p-1 transition-all duration-300 group-hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] md:group-hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.16)] md:group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:shadow-none"
          aria-hidden="true"
        >
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- native img retained for responsive object-contain in padded container; Image fill would alter layout
            <img
              src={product.image.url}
              alt={product.image.alt ?? product.name}
              className="object-contain object-center w-full h-auto block rounded-[14px] transition-transform duration-500 group-hover:scale-[1.01] md:group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-navy/5 via-transparent to-navy/5 rounded-[14px]">
              <span className="text-navy-light/40 text-center px-3 text-sm leading-snug" aria-hidden="true">
                {product.name}
              </span>
            </div>
          )}

          {/* Subtle warm overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]" aria-hidden="true" />
        </div>
      </Link>

      {/* Product name - outside the card, below, left-aligned */}
      <p className="mt-1.5 text-[14px] font-normal text-[#1A1A1A] dark:text-foreground/90 leading-snug truncate max-w-full">
        {product.name}
      </p>
    </article>
  );
}