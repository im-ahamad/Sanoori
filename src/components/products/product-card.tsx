import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { PublicProductSummary } from "@/lib/public/catalogue";
import { siteConfig } from "@/config/site";
import { createWhatsAppProductLink } from "@/lib/contact/whatsapp";
import { AvailabilityBadge } from "@/components/products/availability-badge";
import { getCategoryIconElement } from "@/lib/category-icons";

interface ProductCardProps {
  product: PublicProductSummary;
}

/**
 * Catalogue card. The main action is "Get a Quote": when the business WhatsApp
 * number is configured it opens WhatsApp with a pre-filled message, otherwise
 * it goes to the short request form with this product already selected. Cards
 * prefer the real product photo and fall back to a branded navy/gold tile so a
 * missing image never renders broken.
 */
export function ProductCard({ product }: ProductCardProps) {
  const detailsHref = `/products/${product.slug}`;
  const requestHref = `/request-quote?product=${product.slug}`;
  const cardImage = product.image;

  const whatsappLink = createWhatsAppProductLink({
    productName: product.name,
    productId: product.id,
    productCode: product.productCode,
    quantity: 1,
    productUrl: `${siteConfig.url}${detailsHref}`,
  });

  const quoteHref = whatsappLink?.url ?? requestHref;
  const quoteLabel = whatsappLink
    ? `Get a quote for ${product.name} on WhatsApp`
    : `Get a quote for ${product.name}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-dark/40 hover:shadow-lg">
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
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
            {product.categoryName}
          </p>
          <AvailabilityBadge availability={product.availability} />
        </div>

        <h3 className="mt-2 font-heading text-base font-semibold text-foreground sm:text-lg">
          <Link
            href={detailsHref}
            className="rounded-sm transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h3>

        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-4 flex flex-1 items-end gap-2">
          <a
            href={quoteHref}
            {...(whatsappLink
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            aria-label={quoteLabel}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {whatsappLink && <MessageCircle className="size-4" aria-hidden="true" />}
            Get a Quote
          </a>
          <Link
            href={detailsHref}
            aria-label={`View details for ${product.name}`}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="hidden sm:inline">View</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}