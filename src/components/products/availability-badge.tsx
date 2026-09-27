"use client";

import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/generated/prisma";
import { useTranslations } from "@/lib/i18n";

interface AvailabilityBadgeProps {
  availability: Availability;
}

const STYLES: Record<Availability, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  IN_STOCK: { variant: "default" },
  ON_REQUEST: { variant: "secondary" },
  OUT_OF_STOCK: { variant: "outline", className: "bg-border" },
};

const AVAILABILITY_KEYS: Record<Availability, string> = {
  IN_STOCK: "inStock",
  ON_REQUEST: "onRequest",
  OUT_OF_STOCK: "outOfStock",
};

/**
 * Renders a product's real availability as a labeled badge. The label text
 * (never color alone) communicates the state; color only reinforces it.
 */
export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const t = useTranslations();
  const style = STYLES[availability] ?? { variant: "outline" as const };
  const labelKey = AVAILABILITY_KEYS[availability];
  const label = t.common[labelKey as keyof typeof t.common] ?? availability;
  return <Badge variant={style.variant} className={style.className}>{label}</Badge>;
}