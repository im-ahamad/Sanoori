import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for the Sanoori Trading marquee visual
 * (`/images/hero.jpg`).
 *
 * Used as a layered, full-bleed backdrop across the public site (hero, CTA
 * bands, interior page headers). The raw image is deliberately dressed under
 * navy/gold overlays so it reads as brand personality instead of a raw photo:
 * gradient washes keep text contrast, a slow zoom adds motion without
 * animation cost, and everything is decorative (`aria-hidden`).
 *
 * Dress with `variant`:
 *  - "hero":   strong left-to-right navy wash for full-bleed dark bands.
 *  - "header": vertical navy wash for interior page titles.
 *  - "band":   uniform navy wash for compact dark panels.
 *  - "faint":  near-white wash for light sections where dark text must stay.
 */
const WEBSITE_VISUAL = "/images/hero.jpg";

const WEBSITE_VISUAL_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wgARCAAOABgDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABQABA//EABUBAQEAAAAAAAAAAAAAAAAAAAEC/9oADAMBAAIQAxAAAAE1Q5CXhZD/AP/EABoQAQACAwEAAAAAAAAAAAAAAAEAAgMRMTL/2gAIAQEAAQUCOtQxtYalkD1P/8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAwEBPwE//8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAgEBPwE//8QAGRAAAgMBAAAAAAAAAAAAAAAAAAEQESFR/9oACAEBAAY/Ai70XYeR/8QAGhAAAwADAQAAAAAAAAAAAAAAAAERITFBkf/aAAgBAQABPyFKgy8pTF6Mlx+mEtkG3pg//9oADAMBAAIAAwAAABDvH//EABYRAQEBAAAAAAAAAAAAAAAAAAARMf/aAAgBAwEBPxDEf//EABURAQEAAAAAAAAAAAAAAAAAABEA/9oACAECAQE/EBm//8QAGhABAAMBAQEAAAAAAAAAAAAAAQARITFRQf/aAAgBAQABPxCkHVI4MuPWNaSmImG7YKHtE5FAbc3fnk//2Q==";

type VisualBackdropVariant = "hero" | "header" | "band" | "faint";

interface VisualBackdropProps {
  variant?: VisualBackdropVariant;
  /** Tailwind object-position class, e.g. "object-center" or "object-bottom". */
  objectPosition?: string;
  /** Marks the hero/LCP instance so the browser preloads it eagerly. */
  priority?: boolean;
  /** Override the source image. Defaults to the shared marquee visual. */
  src?: string;
  className?: string;
}

const overlayByVariant: Record<VisualBackdropVariant, string> = {
  hero: "bg-gradient-to-r from-navy-dark/90 via-navy/70 to-navy-dark/35",
  header:
    "bg-gradient-to-b from-navy-dark/95 via-navy-dark/80 to-navy-dark/65",
  band: "bg-navy-dark/80",
  faint: "bg-white/85",
};

/** Slow, subtle ambient zoom — disabled for users who prefer reduced motion. */
const zoomClass = "backdrop-zoom";

export function VisualBackdrop({
  variant = "hero",
  objectPosition = "object-center",
  priority = false,
  src,
  className,
}: VisualBackdropProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <Image
        src={src ?? WEBSITE_VISUAL}
        alt=""
        fill
        sizes="100vw"
        quality={60}
        priority={priority}
        placeholder={priority ? "blur" : "empty"}
        blurDataURL={WEBSITE_VISUAL_BLUR}
        className={cn("object-cover", objectPosition, zoomClass)}
      />
      <div className={cn("absolute inset-0", overlayByVariant[variant])} />
    </div>
  );
}