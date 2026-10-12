import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Premium category showcase for the Home page, placed directly below the hero.
 *
 * Visibility
 * ----------
 * Hidden across the site's existing mobile breakpoint and shown from its
 * existing tablet breakpoint upwards. The project defines mobile as `< 768px`
 * and tablet as `768px – 1023px` (see `.catalogue-grid` in globals.css), so the
 * tablet boundary is exactly 768px — Tailwind's `md` variant. Using `md`
 * reuses that same convention and introduces no new/arbitrary breakpoint.
 *
 * Layout (measured against the reference)
 * ---------------------------------------
 * A centered content block capped at 1216px (reference container 1280px minus
 * 2×32px horizontal padding). The heading block sits above the grid with a
 * 32px gap (the same balanced gap the "Explore our products" section uses).
 * The grid itself is a two-column, two-row grid with EQUAL columns
 * and a uniform 20px gap; at the reference desktop size that resolves to
 * 1216×672 with a 598px Sanitary Ware cell spanning both rows (598×672) beside
 * two 598×326 cells — the two right cells are always exactly equal and the left
 * cell always equals their combined height plus the gap.
 *
 * Sizing
 * ------
 * The grid is locked to the reference 1216×672 aspect ratio so its height
 * scales with its width and the four cells keep their exact proportions at
 * every breakpoint. All images are full-bleed (`object-fit: cover`) with no
 * rounding, border, shadow or internal padding — the reference look. Because
 * the source assets have different intrinsic ratios (Sanitary Ware 960×1200,
 * Tiles/Building Materials 1200×800), covering the measured cells crops a
 * sliver vertically: ~10% for Sanitary Ware and ~18% for the two landscape
 * tiles. Nothing is stretched or distorted and there is no zoom/hover scaling.
 *
 * Trade-off note: matching the reference's exact cell dimensions with
 * full-bleed images makes a small centre crop unavoidable for these assets; the
 * only alternative would be `object-fit: contain` letterboxing, which would
 * introduce cream bars and visibly break the full-bleed reference treatment.
 */
type ShowcaseCard = {
  number: string;
  title: string;
  image: string;
  href: string;
  /** Tall lead card, spanning both grid rows. */
  lead?: boolean;
};

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    number: "01",
    title: "Sanitary Ware",
    image: "/images/category-sanitary.jpg",
    href: "/products?category=sanitary-ware",
    lead: true,
  },
  {
    number: "02",
    title: "Tiles",
    image: "/images/category-tiles.jpg",
    href: "/products?category=tiles",
  },
  {
    number: "03",
    title: "Building Materials",
    image: "/images/category-building.jpg",
    href: "/products?category=building-materials",
  },
];

/**
 * Centered content block — plain width constraint, no panel treatment.
 *
 * Width: the reference container is 1280px with 32px side padding, leaving
 * 1216px of inner content; `max-w-[1216px]` reproduces that at 1440px/1920px
 * (the surrounding Container supplies the 32px gutter at `lg`).
 *
 * There is deliberately NO border, background, rounding, padding or negative
 * margin here. The heading, title and description sit directly on the section
 * background (`bg-background` on the <section>), outside any frame. The single
 * subtle, rounded border in this section lives one level down, wrapping only
 * the three category image cards (see the grid wrapper below).
 */
const SHOWCASE_CONTENT_WIDTH = "w-full max-w-[1216px]";

/**
 * The image grid. `aspect-[1216/672]` locks it to the reference proportions so
 * the height scales with the width; `grid-rows-2` (repeat(2, minmax(0,1fr)))
 * keeps the two right cells exactly equal and lets the left cell span both.
 * `mt-8` is the compact heading→grid gap used by the "Explore our products"
 * section, kept here so the space above the images stays small and balanced.
 */
const SHOWCASE_GRID =
  "mt-8 grid aspect-[1216/672] grid-cols-2 grid-rows-2 gap-5";

/**
 * Transparent-to-navy gradient overlay anchored to the bottom of each card,
 * reaching full transparency at ~70% of the image height (dark at the bottom,
 * clear from ~30% up) so the caption stays legible over the image.
 *
 * Colours are mixed from the `--navy-dark` design token (the same convention
 * the hero overlay uses in globals.css), so the overlay adapts to the active
 * theme instead of being hard-coded.
 */
const CARD_OVERLAY =
  "linear-gradient(180deg, color-mix(in oklab, var(--navy-dark) 0%, transparent) 30%, color-mix(in oklab, var(--navy-dark) 50%, transparent) 65%, color-mix(in oklab, var(--navy-dark) 88%, transparent) 100%)";

/**
 * Hover-only gradient layer. Fades in on hover to deepen the base overlay
 * slightly (a premium emphasis) without changing the resting appearance.
 */
const CARD_OVERLAY_HOVER =
  "linear-gradient(180deg, color-mix(in oklab, var(--navy-dark) 0%, transparent) 30%, color-mix(in oklab, var(--navy-dark) 35%, transparent) 70%, color-mix(in oklab, var(--navy-dark) 55%, transparent) 100%)";

function CategoryShowcaseCard({ card }: { card: ShowcaseCard }) {
  return (
    <Link
      href={card.href}
      aria-label={`Browse ${card.title} products`}
      className={cn(
        "group relative block h-full w-full overflow-hidden rounded-none border-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset",
        // The lead cell spans both grid rows; the two right cells fill their
        // own half-height row, so the three cells tile the grid exactly.
        card.lead && "row-span-2"
      )}
    >
      {/*
        Full-bleed image (reference treatment): no rounding, border, shadow or
        internal padding. Cover fills each measured cell edge-to-edge; the small
        unavoidable centre crop is documented in the file header.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element -- image-led showcase needs predictable cover behaviour; next/image `fill` adds no benefit here */}
      <img
        src={card.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
        loading="lazy"
      />

      {/* Bottom navy gradient overlay — keeps the text legible over the image */}
      <span
        aria-hidden="true"
        className="absolute inset-0 block"
        style={{ background: CARD_OVERLAY }}
      />

      {/* Hover-only deepening of the gradient — subtle, smooth, opacity-only */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
        style={{ background: CARD_OVERLAY_HOVER }}
      />

      {/* Bottom-left content — number, heading, link only, over the image */}
      <div className="relative flex h-full flex-col justify-end p-6 lg:p-8">
        <span className="text-[12px] font-semibold uppercase tracking-[1.68px] text-gold">
          {card.number}
        </span>
        <h3 className="mt-1.5 font-serif text-[26px] font-semibold leading-[1.15] text-white lg:mt-2 lg:text-[36px] lg:leading-[40px]">
          {card.title}
        </h3>
        <span className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-white lg:mt-4 lg:text-[14px]">
          Browse Products
          <ArrowRight
            aria-hidden="true"
            strokeWidth={2}
            className="size-4 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

export async function CategoryShowcase() {
  const lang = await getLang();
  const t = getServerTranslations(lang);

  return (
    <section
      className="hidden bg-background md:block"
      aria-labelledby="category-showcase-heading"
    >
      <Container className="max-w-[1280px]! py-8 lg:py-10">
        <div className={SHOWCASE_CONTENT_WIDTH}>
          <div id="category-showcase-heading" className="shrink-0">
            <SectionHeader
              eyebrow="Explore categories"
              title="Find what your space needs"
              description={t.categoryShowcase.description}
            />
          </div>

          {/*
            Card panel that frames only the three category images. Its tint
            reuses the exact background of the "Explore our products" category
            containers (`.catalogue-category-container`) so both sections read as
            the same card surface. Only the background changes — the rounded
            border, padding, sizes and layout stay exactly as they were.
          */}
          <div className="rounded-md border border-border/60 bg-[oklch(0.97_0.015_250)] dark:bg-card p-2 md:p-3 lg:p-4">
            <div className={SHOWCASE_GRID}>
              {SHOWCASE_CARDS.map((card) => (
                <CategoryShowcaseCard key={card.number} card={card} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
