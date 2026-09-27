"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { productImageHero, productImageThumb } from "@/lib/cloudinary-url";
import { ProductImagePlaceholder } from "@/components/products/product-image-placeholder";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

/**
 * Responsive image gallery. Minimal client state (selected thumbnail) — the
 * images come from the server with Cloudinary-optimized delivery URLs.
 * Keyboard accessible: thumbnails are real buttons with visible focus.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected =
    images[selectedIndex] ?? { id: "fallback", url: "", alt: null };

  const selectedAlt =
    selected.alt ?? `${productName} product image ${selectedIndex + 1} of ${images.length}`;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_88px] lg:items-start">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/50">
        {selected.url ? (
          <Image
            src={productImageHero(selected.url, 1080)}
            alt={selectedAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            unoptimized
            className="object-contain"
            priority
          />
        ) : (
          <ProductImagePlaceholder label="Photos coming soon" />
        )}
      </div>

      {/* Thumbnails — horizontal scroll on mobile, vertical column on desktop */}
      <ul
        className="order-first flex gap-2 overflow-x-auto pb-1 lg:order-none lg:col-start-2 lg:row-start-1 lg:flex-col lg:overflow-visible"
        aria-label="Product image gallery"
      >
{images.map((image, index) => {
            const alt = image.alt ?? `${productName} image ${index + 1}`;
            const active = index === selectedIndex;
            return (
              <li key={image.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Show image ${index + 1} of ${images.length}: ${alt}`}
                  aria-pressed={active}
                  className={cn(
                    "relative block size-16 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-20 lg:size-full lg:aspect-square",
                    active
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-md">
                    <Image
                      src={productImageThumb(image.url, 200)}
                      alt=""
                      fill
                      sizes="80px"
                      unoptimized
                      priority={index === 0}
                    />
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}