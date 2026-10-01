"use client";

import { useRef, useState, useEffect } from "react";
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
 * Responsive image gallery with Amazon-style two-panel magnifier.
 * - Left: Original image at normal size
 * - Right: Zoomed detail panel that follows cursor position
 * - Mobile: Normal image behavior (no zoom panel)
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const selected =
    images[selectedIndex] ?? { id: "fallback", url: "", alt: null };

  const selectedAlt =
    selected.alt ?? `${productName} product image ${selectedIndex + 1} of ${images.length}`;

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsHovering(true);
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomPosition(null);
  };

  const handleTouchStart = () => {
    setIsHovering(false);
    setZoomPosition(null);
  };

  const zoomImageUrl = selected.url ? productImageHero(selected.url, 2000) : null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_72px] lg:grid-cols-[minmax(0,1fr)_88px] lg:items-start relative">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/50">
        {selected.url ? (
          <div
            ref={mainImageRef}
            className="relative w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
          >
            <Image
              src={productImageHero(selected.url, 1080)}
              alt={selectedAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              unoptimized
              className="object-contain"
              priority
            />
            {/* Lens overlay on main image */}
            {isHovering && zoomPosition && !isMobile && (
              <div
                className="absolute pointer-events-none border-2 border-primary/50 bg-primary/10 rounded"
                style={{
                  width: "100px",
                  height: "100px",
                  left: `calc(${zoomPosition.x}% - 50px)`,
                  top: `calc(${zoomPosition.y}% - 50px)`,
                  transformOrigin: "center center",
                }}
                aria-hidden="true"
              />
            )}
          </div>
        ) : (
          <ProductImagePlaceholder label="Photos coming soon" />
        )}
      </div>

      {/* Zoom panel — appears to the right on desktop when hovering */}
      {!isMobile && isHovering && zoomPosition && zoomImageUrl && (
        <div
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-[45vw] max-w-[700px] min-w-[280px] aspect-square overflow-hidden rounded-lg border border-border bg-muted/50 shadow-xl"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
          aria-label="Zoomed product image detail"
        >
          <div className="relative w-full h-full">
            <Image
              src={zoomImageUrl}
              alt={selectedAlt}
              fill
              sizes="50vw"
              unoptimized
              className={cn(
                "object-contain transition-transform duration-150 ease-out",
                "scale-300"
              )}
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              priority
            />
          </div>
        </div>
      )}

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
                    "relative block size-16 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-18 md:size-20 lg:size-full lg:aspect-square",
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