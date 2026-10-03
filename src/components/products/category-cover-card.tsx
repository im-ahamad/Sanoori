import Link from "next/link";
import Image from "next/image";
import type { PublicCategory } from "@/lib/public/catalogue";
import { cn } from "@/lib/utils";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

/**
 * Maps category slugs to their hero images.
 * Falls back to database-stored image or gradient.
 */
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "sanitary-ware": "/images/category-sanitary.jpg",
  tiles: "/images/category-tiles.jpg",
  "building-materials": "/images/category-building.jpg",
};

/**
 * Per-category aspect ratios matching the source image dimensions.
 * Sanitary: 960×1200 = 4:5
 * Tiles: 1200×800 = 3:2
 * Building Materials: 1200×800 = 3:2
 */
const CATEGORY_ASPECT_RATIOS: Record<string, string> = {
  "sanitary-ware": "4/5",
  tiles: "3/2",
  "building-materials": "3/2",
};

/**
 * Neutral background for letterboxing when using object-contain.
 * Warm neutral consistent with Sanoori design system.
 */
const IMAGE_BACKGROUND = "bg-[oklch(0.97_0.003_70)]"; // very subtle warm gray

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

function getCategoryImage(category: PublicCategory): string | null {
  if (CATEGORY_HERO_IMAGES[category.slug]) {
    return CATEGORY_HERO_IMAGES[category.slug];
  }
  return category.image;
}

function getCategoryAspectRatio(category: PublicCategory): string {
  return CATEGORY_ASPECT_RATIOS[category.slug] ?? "4/3";
}

function hasCategoryImage(category: PublicCategory): boolean {
  const image = getCategoryImage(category);
  if (!image) return false;
  if (/^https?:\/\//i.test(image)) return true;
  if (image.startsWith("/images/")) {
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      return fs.existsSync(path.join(process.cwd(), "public", image));
    } catch {
      return false;
    }
  }
  return true;
}

interface CategoryCoverCardProps {
  category: PublicCategory;
  productCount: number;
  subcategoryCount: number;
}

export async function CategoryCoverCard({
  category,
  productCount,
  subcategoryCount,
}: CategoryCoverCardProps) {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const href = `/products?category=${category.slug}`;
  const imageSrc = getCategoryImage(category);
  const hasImage = hasCategoryImage(category);
  const translatedName = t.categories[category.slug as keyof typeof t.categories] ?? category.name;
  const aspectRatio = getCategoryAspectRatio(category);

  return (
    <Link
      href={href}
      aria-label={`${translatedName} — ${productCount} products, ${subcategoryCount} subcategories`}
      className="group relative block overflow-hidden bg-white border border-border rounded-xl shadow-sm transition-all duration-200 ease-out hover:shadow-xl hover:-translate-y-1 hover:border-gold/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Category Image — object-contain preserves full composition, neutral background for letterboxing */}
      <div className={`relative ${IMAGE_BACKGROUND} overflow-hidden`} style={{ aspectRatio }} aria-hidden="true">
        {hasImage ? (
          <Image
            src={imageSrc!}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 33vw, (max-width: 1536px) 33vw, 33vw"
            className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy-dark" />
        )}
      </div>

      {/* Content Panel — solid white background */}
      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 bg-white border-t border-border/50">
        <h3 className="font-heading text-lg lg:text-xl font-semibold tracking-tight text-foreground">
          {translatedName}
        </h3>

        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {subcategoryCount} {subcategoryCount === 1 ? "subcategory" : "subcategories"}
          </span>
          <span className="w-px h-4 bg-border" aria-hidden="true" />
          <span>
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
        </div>
      </div>
    </Link>
  );
}