import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PublicProductSummary } from "@/lib/public/catalogue";
import { AvailabilityBadge } from "@/components/products/availability-badge";
import { getCategoryIconElement } from "@/lib/category-icons";

type ProductCardVariant = "default" | "grid" | "showcase" | "catalogue";

interface ProductCardProps {
  product: PublicProductSummary;
  hideAvailabilityBadge?: boolean;
  variant?: ProductCardVariant;
  categoryLabel: string;
  askForPriceLabel: string;
  viewDetailsLabel: string;
  availabilityLabel?: string;
  availabilityVariant?: "default" | "secondary" | "outline";
}

/**
 * Catalogue card. The main action is "Ask for Price": it links to the
 * product-specific request page with this product already selected. Cards
 * prefer the real product photo and fall back to a branded navy/gold tile so a
 * missing image never renders broken.
 */
export function ProductCard({
  product,
  hideAvailabilityBadge = false,
  variant = "default",
  categoryLabel,
  askForPriceLabel,
  viewDetailsLabel,
  availabilityLabel,
  availabilityVariant,
}: ProductCardProps) {
  const detailsHref = `/products/${product.slug}`;
  const cardImage = product.image;

  const isGrid = variant === "grid";
  const isShowcase = variant === "showcase";
  const isCatalogue = variant === "catalogue";

  /*
   * `catalogue` variant — mirrors the Home page catalogue card
   * (`CatalogueProductCard` in components/home/product-catalogue.tsx): square
   * 1:1 image container with a soft blue-grey background, `object-contain`
   * fitting, 8px corners, no card border/shadow, and the product name below the
   * image. The two /products actions (Ask for Price + View) are kept exactly as
   * they are in the default variant so nothing about those buttons changes.
   */
  if (isCatalogue) {
    return (
      <article className="catalogue-card group">
        <Link
          href={detailsHref}
          className="relative block aspect-square overflow-hidden rounded-[8px] bg-[oklch(0.97_0.015_250)] transition-all duration-300 group-hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] dark:bg-muted"
          aria-label={`View ${product.name}`}
          tabIndex={-1}
        >
          {cardImage ? (
            <Image
              src={cardImage.url}
              alt={cardImage.alt ?? product.name}
              fill
              sizes="(max-width: 767px) 33vw, 25vw"
              className="block rounded-[8px] object-contain object-center transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-[oklch(0.97_0.015_250)] dark:bg-muted">
              <span
                className="text-navy-light/40 dark:text-muted-foreground text-center px-3 text-sm leading-snug"
                aria-hidden="true"
              >
                {product.name}
              </span>
            </div>
          )}

          {/* Subtle warm overlay on hover — same treatment as the Home card */}
          <div
            className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-gold/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        </Link>

        {/* Product name — same placement and typography as the Home catalogue card */}
        <p className="catalogue-name text-[14px] font-normal text-[#1A1A1A] dark:text-foreground/90 leading-snug max-w-full break-words">
          <Link
            href={detailsHref}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </p>

        {/*
          Actions are intentionally identical to the default variant above (same
          order, labels, links, classes) so /products keeps its exact buttons.
        */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sanoori-product-actions">
          <Link
            href={`/request-quote?product=${product.slug}`}
            aria-label={`Ask for the price of ${product.name}`}
            className="inline-flex h-11 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-0 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {askForPriceLabel}
          </Link>
          <Link
            href={detailsHref}
            aria-label={`View details for ${product.name}`}
            className="inline-flex h-11 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-0 text-center text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {viewDetailsLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`
        group flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-300
        ${isShowcase
          ? "rounded-xl bg-card shadow-sm hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:border-gold/30"
          : isGrid
          ? "border-b border-r border-border bg-card"
          : "rounded-lg border border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-gold-dark/40 hover:shadow-lg"
        }
      `}
    >
      <Link
        href={detailsHref}
        className="relative block aspect-[4/3] overflow-hidden bg-navy-dark"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        {cardImage ? (
          <Image
            src={cardImage.url}
            alt={cardImage.alt ?? product.name}
            fill
            sizes="(max-width: 1023px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-dark">
            <span
              className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl"
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className="text-gold/50 transition-colors group-hover:text-gold/70"
            >
              {getCategoryIconElement(product.categorySlug, {
                className: "size-12",
                strokeWidth: 1.4,
              })}
            </span>
          </span>
        )}
        <span
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          aria-hidden="true"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {categoryLabel}
          </p>
          {!hideAvailabilityBadge && availabilityLabel && (
            <AvailabilityBadge
              label={availabilityLabel}
              variant={availabilityVariant ?? "outline"}
            />
          )}
        </div>

        <h3 className="mt-2 font-heading text-base font-semibold text-foreground sm:text-lg">
          <Link
            href={detailsHref}
            className="rounded-sm transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h3>

        {/*
          Actions reflow instead of overflowing. The card column width is set by
          the grid (down to ~216px in the 4-up lg layout), so the labels may not
          have room for one line: with `whitespace-nowrap` the "Ask for Price"
          text was WIDER than its own button and spilled onto the card. Without
          it the label wraps to a second line inside the fixed h-11 (44px) tap
          target, and `text-center` keeps both the single-line and the wrapped
          state centred. Nothing else changes — same buttons, same labels,
          same links, same order.
        */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sanoori-product-actions">
          <Link
            href={`/request-quote?product=${product.slug}`}
            aria-label={`Ask for the price of ${product.name}`}
            className="inline-flex h-11 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-0 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {askForPriceLabel}
          </Link>
          <Link
            href={detailsHref}
            aria-label={`View details for ${product.name}`}
            className="inline-flex h-11 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-0 text-center text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {viewDetailsLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}