"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicProductSummary } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";

interface ProductShelfProps {
  products: PublicProductSummary[];
  categorySlug: string;
}

/**
 * Product shelf component for category blocks.
 * Displays products in a horizontal row with square image containers.
 * Each product tile has square image (1:1) with name and optional subcategory below.
 */
export function ProductShelf({ products, categorySlug }: ProductShelfProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Representative products">
      {products.map((product) => (
        <article key={product.id} className="group relative flex-shrink-0" role="listitem">
          <Link
            href={`/products/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="block overflow-hidden bg-white border border-border rounded-lg shadow-sm transition-all duration-200 ease-out hover:shadow-lg hover:border-gold/40 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* Square image container - 1:1 aspect ratio */}
            <div className="relative aspect-square overflow-hidden bg-muted p-3" aria-hidden="true">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt ?? product.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 25vw"
                  className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-dark">
                  <span className="text-navy-light/50 text-center px-2" aria-hidden="true">
                    {product.name}
                  </span>
                </div>
              )}
            </div>

            {/* Product info below image */}
            <div className="p-3">
              <h4 className="font-heading text-sm font-medium text-foreground line-clamp-1">
                {product.name}
              </h4>
              {product.subcategoryName && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {product.subcategoryName}
                </p>
              )}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}