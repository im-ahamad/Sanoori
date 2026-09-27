"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const flashMessages = {
  created: "Product created successfully.",
  updated: "Product updated successfully.",
  deleted: "Product deleted.",
  inquiryUpdated: "Inquiry status updated.",
  subcategoryCreated: "Subcategory created successfully.",
  subcategoryUpdated: "Subcategory updated successfully.",
  subcategoryDeleted: "Subcategory deleted.",
} as const;

export type FlashKind = keyof typeof flashMessages;

export function FlashBanner({ kind }: { kind: FlashKind }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

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
        aria-label="Dismiss notification"
        className="text-emerald-900/70 hover:text-emerald-900"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}