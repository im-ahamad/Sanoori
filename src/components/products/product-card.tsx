import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import type { PublicProductSummary } from "@/lib/public/catalogue";
import { siteConfig } from "@/config/site";
import { createWhatsAppProductLink } from "@/lib/contact/whatsapp";
import { AvailabilityBadge } from "@/components/products/availability-badge";
import { ProductImagePlaceholder } from "@/components/products/product-image-placeholder";

interface ProductCardProps {
  product: PublicProductSummary;
}

/**
 * Catalogue card. Server-rendered; the WhatsApp action is only shown when the
 * business WhatsApp number is configured (otherwise customers continue to the
 * details page, which offers fallback contact channels).
 */
export function ProductCard({ product }: ProductCardProps) {
  const detailsHref = `/products/${product.slug}`;
  const cardImage = product.image;

  const whatsappLink = createWhatsAppProductLink({
    productName: product.name,
    productId: product.id,
    productCode: product.productCode,
    quantity: 1,
    productUrl: `${siteConfig.url}${detailsHref}`,
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      <Link
        href={detailsHref}
        className="relative block aspect-[4/3] overflow-hidden bg-muted/50"
        aria-label={product.image ? `View ${product.name}` : `${product.name} (no image available yet)`}
        tabIndex={-1}
      >
        {cardImage ? (
          <Image
            src={cardImage.url}
            alt={cardImage.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductImagePlaceholder
            className="absolute inset-0"
            label="Image coming soon"
          />
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-navy-dark shadow-sm">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.categoryName}
            {product.subcategoryName ? ` · ${product.subcategoryName}` : ""}
          </p>
          <AvailabilityBadge availability={product.availability} />
        </div>

        <h3 className="mt-2 font-heading text-base font-semibold text-foreground">
          <Link
            href={detailsHref}
            className="transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
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
          <Link
            href={detailsHref}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View Details
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          {whatsappLink && (
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-10 items-center justify-center rounded-md bg-[#25D366] text-white transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
              aria-label={`Buy ${product.name} on WhatsApp`}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}