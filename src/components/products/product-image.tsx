import Image from "next/image";
import { cn } from "@/lib/utils";
import { productImageHero } from "@/lib/cloudinary-url";
import { ProductImagePlaceholder } from "@/components/products/product-image-placeholder";

interface ProductImageProps {
  /** Untransformed Cloudinary delivery URL, or an empty string when none exists. */
  url: string;
  alt: string;
  /** Mirrors `ProductGallery`'s `selected.url ? ... : placeholder` branch. */
  hasImage: boolean;
}

/**
 * The main product image, rendered on the server so the photograph and its
 * `w_1080` delivery URL are present in the initial HTML — the browser can start
 * downloading it during parse instead of waiting for client hydration.
 *
 * Deliberately not a client component: it holds no interaction. The interactive
 * magnifier (hover zoom, lens, mouse/touch handlers) stays in `ProductGallery`,
 * which wraps this element and keeps querying its rendered `<img>` for
 * measurements.
 *
 * Props and classes below are copied verbatim from the previous inline markup
 * so the appearance, layout, and image attributes are unchanged.
 */
export function ProductImage({ url, alt, hasImage }: ProductImageProps) {
  const displayImageUrl = hasImage ? productImageHero(url, 1080) : "";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-white dark:bg-background lg:aspect-square",
        !hasImage && "aspect-square"
      )}
    >
      {hasImage ? (
        // The 1080×1080 props mirror the `c_limit` delivery box: a truthful
        // placeholder ratio until the bytes arrive, then the image's own
        // natural ratio takes over (attributes map to `aspect-ratio: auto …`).
        <Image
          src={displayImageUrl}
          alt={alt}
          width={1080}
          height={1080}
          sizes="(max-width: 1024px) 100vw, 640px"
          unoptimized
          className="block w-full h-auto object-contain lg:absolute lg:inset-0 lg:h-full lg:w-full"
          style={{ objectFit: "contain" }}
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <ProductImagePlaceholder label="Photos coming soon" />
      )}
    </div>
  );
}
