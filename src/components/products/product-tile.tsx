"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicProductSummary } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";

interface ProductTileProps {
  product: PublicProductSummary;
  /** Aspect ratio for the image box — portrait orientation for catalogue density */
  aspectRatio?: string;
}

/**
 * Image-only product tile for the home page category showroom.
 *
 * - Portrait-oriented cells (3:4) for dense Amazon-style catalogue layout
 * - Uniform dimensions enforced by CSS aspect-ratio
 * - Thin border creates clean grid lines between products
 * - object-fit: contain ensures no cropping/stretching
 * - Preserves existing click navigation to product detail page
 * - Hover: slight lift, soft shadow, border emphasis (container only, not image)
 * - Accessible: proper link semantics and aria-label
 * - Respects prefers-reduced-motion via Tailwind's motion-reduce variant
 */
export function ProductTile({ product, aspectRatio = "3/4" }: ProductTileProps) {
  const detailsHref = `/products/${product.slug}`;
  const cardImage = product.image;

  return (
    <article className="group relative flex-shrink-0">
      <Link
        href={detailsHref}
        className="block overflow-hidden bg-white border border-border transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-gold/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.name}`}
      >
        <div
          className="relative overflow-hidden p-3"
          style={{ aspectRatio }}
          aria-hidden="true"
        >
          {cardImage ? (
            <Image
              src={cardImage.url}
              alt={cardImage.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.66vw"
              className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-dark">
              <span className="text-navy-light/50" aria-hidden="true">
                {product.categoryName}
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}