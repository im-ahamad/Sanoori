import Image from "next/image";
import { businessConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  /** Defaults to the current site path; override only for e.g. OG images. */
  src?: string;
}

const imageSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

/**
 * Single source of truth for the Sanoori Trading brand mark.
 *
 * Renders the configured logo asset on every public page (header, mobile
 * navigation, footer). Falls back to a neutral monogram if the asset is not
 * available — it should never look broken.
 */
export function Brand({
  size = "md",
  showWordmark = true,
  className,
  src,
}: BrandProps) {
  const logoSrc = src ?? businessConfig.logo.src;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {logoSrc ? (
        <span
          className={cn(
            "relative overflow-hidden rounded-md",
            imageSizes[size]
          )}
        >
          <Image
            src={logoSrc}
            alt={businessConfig.logo.alt}
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "rounded-md bg-primary font-heading font-bold text-primary-foreground",
            imageSizes[size]
          )}
        >
          {businessConfig.name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-heading font-bold tracking-tight text-foreground",
              size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg"
            )}
          >
            {businessConfig.name}
          </span>
        </span>
      )}
    </span>
  );
}