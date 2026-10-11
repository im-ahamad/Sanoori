import { Container } from "@/components/layout/container";
import { getHomeShowcaseProductsByCategory } from "@/lib/public/catalogue";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "@/components/shared/section-header";
import type { PublicProductSummary } from "@/lib/public/catalogue";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Premium product catalogue gallery for the home page.
 *
 * Layout:
 * - Section header: "Explore our products" / "A selection from our catalogue"
 * - Three category sections (Sanitary Ware, Tiles, Building Materials)
 * - Each category: heading + product grid (8 products max)
 * - Mobile: exactly 3 columns, 0px gaps
 * - Tablet: exactly 4 columns, 0px gaps
 * - Desktop: exactly 4 columns, with approved desktop spacing
 * - Product cards: square image container (1:1), rounded corners, transparent bg,
 *   object-fit: contain, product name below image only
 * - Hover effect: product name hidden by default on hover-capable devices, revealed on hover
 * - Touch devices: product names always visible
 */
export async function ProductCatalogue() {
  const lang = await getLang();
  const t = getServerTranslations(lang);

  // Fetch 16 products per category (max needed for desktop: 4×4)
  const categoryGroups = await getHomeShowcaseProductsByCategory(16);

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
    <section className="section-spacing bg-background" aria-labelledby="catalogue-heading">
      <Container>
        {/* Section header — exact text as specified */}
        <Reveal>
          <div id="catalogue-heading">
            <SectionHeader
              eyebrow={t.productShowcase.eyebrow}
              title={t.productShowcase.title}
              align="left"
            />
          </div>
        </Reveal>

        {/* Three category sections with product grids */}
        <div className="mt-8 space-y-3">
          {orderedGroups.map((group, groupIndex) => (
            <Reveal key={group.category.id} delay={groupIndex * 0.08} className="space-y-4">
              {/* Category container — unified background, border, rounded corners */}
              <div className="catalogue-category-container">
                {/* Category heading */}
                <h2 className="font-heading text-lg lg:text-xl font-semibold tracking-tight text-foreground px-4 py-3">
                  {categoryLabels[group.category.slug] ?? group.category.name}
                </h2>

                {/* Product Grid — responsive columns per breakpoint */}
                <div className="catalogue-grid px-4 pb-4">
                {group.products.slice(0, 16).map((product, productIndex) => (
                  <Reveal key={product.id} delay={productIndex * 0.02}>
                    <CatalogueProductCard product={product} />
                  </Reveal>
                ))}
              </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Premium catalogue product card — image + name only.
 *
 * - Square 1:1 image container with ~14px rounded corners
 * - Transparent background (blends with page)
 * - object-fit: contain (no cropping)
 * - Product name below, left-aligned, fluid sizing with clamp()
 * - Hover-capable devices: name hidden by default, revealed on hover
 * - Touch devices: name always visible
 * - Links to product detail page
 */
function CatalogueProductCard({ product }: { product: PublicProductSummary }) {
  const href = `/products/${product.slug}`;
  const hasImage = product.image?.url;

  return (
    <article className="catalogue-card group">
      <Link
        href={href}
        className="block group"
        aria-label={`View ${product.name}`}
      >
        {/* Square image container — 1:1 aspect ratio, subtle navy tint background */}
        <div
          className="relative aspect-square overflow-hidden rounded-[8px] bg-[oklch(0.97_0.015_250)] transition-all duration-300 group-hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)]"
          aria-hidden="true"
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- native img retained for responsive object-contain in padded container; Image fill would alter layout
            <img
              src={product.image!.url}
              alt={product.image!.alt ?? product.name}
              className="object-contain object-center w-full h-full block rounded-[8px] transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[oklch(0.97_0.015_250)] rounded-[8px]">
              <span className="text-navy-light/40 text-center px-3 text-sm leading-snug" aria-hidden="true">
                {product.name}
              </span>
            </div>
          )}

          {/* Subtle warm overlay on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[8px]"
            aria-hidden="true"
          />
        </div>
      </Link>

      {/* Product name — outside image container, below, left-aligned */}
      <p className="catalogue-name text-[14px] font-normal text-[#1A1A1A] dark:text-foreground/90 leading-snug max-w-full break-words">
        {product.name}
      </p>
    </article>
  );
}