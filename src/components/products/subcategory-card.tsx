"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicSubcategory } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";

interface SubcategoryCardProps {
  subcategory: PublicSubcategory;
  productCount: number;
  representativeImage: { url: string; alt: string | null } | null;
  categorySlug: string;
  /** Pre-translated subcategory name */
  translatedName: string;
}

/**
 * Subcategory card for category blocks.
 * Square image container with product count and name below.
 * Clickable - navigates to products page filtered by subcategory.
 */
export function SubcategoryCard({
  subcategory,
  productCount,
  representativeImage,
  categorySlug,
  translatedName,
}: SubcategoryCardProps) {
  const href = `/products?category=${categorySlug}&subcategory=${subcategory.slug}`;

  return (
    <Link
      href={href}
      aria-label={`${translatedName} — ${productCount} ${productCount === 1 ? "product" : "products"}`}
      className="group relative block overflow-hidden bg-white border border-border rounded-lg shadow-sm transition-all duration-200 ease-out hover:shadow-lg hover:border-gold/40 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Square image container - 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-muted p-3" aria-hidden="true">
        {representativeImage ? (
          <Image
            src={representativeImage.url}
            alt={representativeImage.alt ?? translatedName}
            fill
            sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy via-navy-dark to-navy-dark">
            <span className="text-navy-light/50 text-center px-2" aria-hidden="true">
              {translatedName}
            </span>
          </div>
        )}
      </div>

      {/* Label below image */}
      <div className="p-3">
        <h4 className="font-heading text-sm font-medium text-foreground line-clamp-1">
          {translatedName}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}