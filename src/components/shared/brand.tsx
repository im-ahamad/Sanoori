import Image from "next/image";
import { businessConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Defaults to businessConfig.logo.src; override only for e.g. OG images. */
  src?: string;
}

const logoHeight = {
  sm: "h-6 w-auto",
  md: "h-7 w-auto sm:h-8",
  lg: "h-9 w-auto sm:h-10",
} as const;

/**
 * Single source of truth for the Sanoori Trading brand mark.
 *
 * Renders the official SVG logotype (symbol + SANOORI TRADING wordmark) on
 * every page — header, mobile navigation, footer and admin surfaces. The SVG
 * is served unoptimized (vector format), scaled by height so its intrinsic
 * aspect ratio is always preserved.
 */
export function Brand({ size = "md", className, src }: BrandProps) {
  const logoSrc = src ?? businessConfig.logo.src;

  return (
    <Image
      src={logoSrc}
      alt={businessConfig.logo.alt}
      width={1120}
      height={338}
      unoptimized
      priority
      sizes="(max-width: 640px) 112px, 160px"
      className={cn("max-w-full object-contain", logoHeight[size], className)}
    />
  );
}