"use client";

import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleProductFeaturedAction } from "@/lib/actions/products";
import { cn } from "@/lib/utils";

interface FeaturedToggleProps {
  productId: string;
  featured: boolean;
}

export function FeaturedToggle({ productId, featured }: FeaturedToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductFeaturedAction(productId, !featured);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={featured}
        title="Mark as featured / unfeatured"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
          featured
            ? "border-accent bg-accent text-gold-dark hover:bg-gold-light/40"
            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        )}
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <Star
            className={cn(
              "size-3",
              featured ? "fill-current text-gold-dark" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        )}
        {featured ? "Featured" : "Feature"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {error ? error : ""}
      </span>
    </span>
  );
}