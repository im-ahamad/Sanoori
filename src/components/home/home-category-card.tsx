import Link from "next/link";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import type { PublicCategory } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";

/**
 * Map category slugs to their specific local hero images in /public/images/
 * These override any database-stored image for the three main categories.
 */
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "sanitary-ware": "/images/category-sanitary.jpg",
  tiles: "/images/category-tiles.jpg",
  "building-materials": "/images/category-building.jpg",
};

/**
 * The category records point at `/images/categories/*.jpg`, files that are not
 * shipped in this repo. Root-relative paths are resolved against `/public` so
 * a missing file degrades to the designed fallback instead of a broken image.
 * Absolute URLs (Cloudinary etc.) are trusted as-is.
 */
function hasResolvableImage(image: string | null | undefined): boolean {
  if (!image) return false;
  if (/^https?:\/\//i.test(image)) return true;
  if (image.startsWith("/images/")) {
    try {
      return existsSync(path.join(process.cwd(), "public", image));
    } catch {
      return false;
    }
  }
  return true;
}

function getCategoryImage(category: PublicCategory): string | null {
  if (CATEGORY_HERO_IMAGES[category.slug]) {
    return CATEGORY_HERO_IMAGES[category.slug];
  }
  return category.image;
}

function hasCategoryImage(category: PublicCategory): boolean {
  return hasResolvableImage(getCategoryImage(category));
}

interface HomeCategoryCardProps {
  category: PublicCategory;
}

/**
 * Home-page-only category card.
 * Displays ONLY the category image and name — no buttons, descriptions,
 * subcategories, badges, or extra text.
 */
export function HomeCategoryCard({ category }: HomeCategoryCardProps) {
  const href = `/products?category=${category.slug}`;
  const imageSrc = getCategoryImage(category);
  const hasImage = hasCategoryImage(category);

  return (
    <Link
      href={href}
      aria-label={`Explore the ${category.name} category`}
      className={cn(
        "group relative block overflow-hidden border border-border bg-card rounded-lg shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-[280px] md:min-h-[320px] lg:min-h-[360px] md:h-full md:min-h-0"
      )}
    >
      {/* Full-bleed image — fills entire card */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="relative w-full h-full">
          {hasImage ? (
            <Image
              src={imageSrc!}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1500px) 50vw, 750px"
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy-dark" />
          )}
        </div>

        {/* Bottom-to-top navy gradient — strong navy at bottom, transparent at top */}
        <div
          className="absolute inset-0 bg-[linear-gradient(0deg,var(--navy-dark)_0%,color-mix(in_oklab,var(--navy-dark)_70%,transparent)_35%,transparent_70%)]"
        />
      </div>

      {/* Category name only — anchored to bottom of card */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
        <h3 className="font-heading text-[1.5rem] sm:text-[1.875rem] lg:text-[2.25rem] font-semibold leading-tight tracking-tight text-white">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}