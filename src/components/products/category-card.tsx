import Link from "next/link";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowRight } from "lucide-react";
import type { PublicCategory } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

/**
 * Map category slugs to their specific local hero images in /public/images/
 * These override any database-stored image for the three main categories.
 */
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "sanitary-ware": "/images/category-sanitary.jpg",
  tiles: "/images/category-tiles.jpg",
  "building-materials": "/images/category-building.jpg",
};

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

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

function getCategoryNumber(index: number): string {
  return String(index).padStart(2, "0");
}

export async function CategoryCard({
  category,
  featured = false,
  index = 1,
  className,
}: {
  category: PublicCategory;
  featured?: boolean;
  index?: number;
  className?: string;
}) {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const href = `/products?category=${category.slug}`;
  const imageSrc = getCategoryImage(category);
  const hasImage = hasCategoryImage(category);
  const categoryNumber = getCategoryNumber(index);
  const translatedName = t.categories[category.slug as keyof typeof t.categories] ?? category.name;
  const translatedDescription = category.description; // Keep original description from DB

  return (
    <Link
      href={href}
      aria-label={t.categoryCard.ariaLabel.replace("{category}", translatedName)}
      className={cn(
        "group relative block overflow-hidden border border-border bg-card rounded-lg shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        featured
          ? "min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] md:h-full md:min-h-0"
          : "min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] md:h-full md:min-h-0",
        className
      )}
    >
{/* Full-bleed image — absolute, fills entire card */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="relative w-full h-full">
          {hasImage ? (
            <Image
              src={imageSrc!}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1500px) 50vw, 750px"
              priority={featured}
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

      {/* Content — anchored to bottom of card, sits on top of image */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8">
        {/* Gold number */}
        <span className="block text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          {categoryNumber}
        </span>

        {/* Category title */}
        <h3 className="mt-1.5 font-heading text-[1.5rem] sm:text-[1.875rem] lg:text-[2.25rem] font-semibold leading-tight tracking-tight text-white">
          {translatedName}
        </h3>

        {/* Description */}
        {translatedDescription && (
          <p className="mt-2 max-w-full sm:max-w-[28rem] lg:max-w-[32rem] text-[0.8125rem] sm:text-sm leading-5 sm:leading-6 text-white/80">
            {translatedDescription}
          </p>
        )}

        {/* Browse Products CTA */}
        <span className="mt-4 inline-flex min-h-[2.5rem] sm:min-h-[2.75rem] items-center gap-2 text-[0.8125rem] sm:text-sm font-semibold text-gold">
          {t.categoryCard.browseProducts}
          <ArrowRight
            className="size-3.5 sm:size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
