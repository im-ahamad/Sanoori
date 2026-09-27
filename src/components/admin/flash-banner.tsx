"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

export type FlashKind =
  | "created"
  | "updated"
  | "deleted"
  | "inquiryUpdated"
  | "subcategoryCreated"
  | "subcategoryUpdated"
  | "subcategoryDeleted";

export function FlashBanner({ kind }: { kind: FlashKind }) {
  const [visible, setVisible] = useState(true);
  const t = useAdminTranslations();

  if (!visible) return null;

  const flashMessages: Record<FlashKind, string> = {
    created: t.common.productCreated,
    updated: t.common.productUpdated,
    deleted: t.common.productDeleted,
    inquiryUpdated: t.common.inquiryUpdated,
    subcategoryCreated: t.common.subcategoryCreated,
    subcategoryUpdated: t.common.subcategoryUpdated,
    subcategoryDeleted: t.common.subcategoryDeleted,
  };

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-900"
    >
      <p className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        {flashMessages[kind]}
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible(false)}
        aria-label={t.common.dismiss}
        className="text-emerald-900/70 hover:text-emerald-900"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}