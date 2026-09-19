import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  className?: string;
  label?: string;
}

/**
 * Clean, neutral placeholder shown when a product has no photograph yet.
 * Decorative (aria-hidden) — real alt text belongs to actual product images.
 */
export function ProductImagePlaceholder({
  className,
  label = "No image available",
}: ProductImagePlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/60 text-muted-foreground",
        className
      )}
    >
      <ImageIcon className="size-10" strokeWidth={1.5} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}