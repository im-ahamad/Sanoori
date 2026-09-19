import { Badge } from "@/components/ui/badge";
import { availabilityLabels } from "@/lib/validators/product";
import type { Availability } from "@/generated/prisma/enums";

interface AvailabilityBadgeProps {
  availability: Availability;
}

const STYLES: Record<Availability, { variant: "default" | "secondary" | "outline"; label: string }> = {
  IN_STOCK: { variant: "default", label: availabilityLabels.IN_STOCK },
  ON_REQUEST: { variant: "secondary", label: availabilityLabels.ON_REQUEST },
  OUT_OF_STOCK: { variant: "outline", label: availabilityLabels.OUT_OF_STOCK },
};

/**
 * Renders a product's real availability as a labeled badge. The label text
 * (never color alone) communicates the state; color only reinforces it.
 */
export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const style = STYLES[availability] ?? { variant: "outline" as const, label: availability };
  return <Badge variant={style.variant}>{style.label}</Badge>;
}