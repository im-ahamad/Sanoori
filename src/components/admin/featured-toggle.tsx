"use client";

import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleProductFeaturedAction } from "@/lib/actions/products";
import { cn } from "@/lib/utils";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface FeaturedToggleProps {
  productId: string;
  featured: boolean;
}

export function FeaturedToggle({ productId, featured }: FeaturedToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = useAdminTranslations();

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
        title={t.common.featuredToggleTitle}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
          featured
            ? "border-accent bg-accent text-gold-text hover:bg-gold-light/40"
            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        )}
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <Star
            className={cn(
              "size-3",
              featured ? "fill-current text-gold-text" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        )}
        {featured ? t.common.featured : t.common.feature}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {error ? error : ""}
      </span>
    </span>
  );
}