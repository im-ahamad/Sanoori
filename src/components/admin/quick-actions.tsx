"use client";

import Link from "next/link";
import {
  MessagesSquare,
  Package,
  PackagePlus,
  type LucideIcon,
} from "lucide-react";
import { useAdminTranslations, type AdminDictionary } from "@/lib/i18n/use-admin-translations";

interface QuickAction {
  labelKey: keyof AdminDictionary["common"];
  descriptionKey: keyof AdminDictionary["common"];
  href: string;
  icon: LucideIcon;
  status: "ready" | "soon";
}

export function QuickActions() {
  const t = useAdminTranslations();

  const actions: QuickAction[] = [
    {
      labelKey: "addProduct",
      descriptionKey: "createNewProduct",
      href: "/admin/products/new",
      icon: PackagePlus,
      status: "ready",
    },
    {
      labelKey: "viewProducts",
      descriptionKey: "browseManageCatalogue",
      href: "/admin/products",
      icon: Package,
      status: "ready",
    },
    {
      labelKey: "viewInquiries",
      descriptionKey: "reviewCustomerRequests",
      href: "/admin/orders",
      icon: MessagesSquare,
      status: "ready",
    },
  ];

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="font-heading text-base font-bold tracking-tight text-foreground"
      >
        {t.common.quickActions}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.labelKey}
              href={action.href}
              className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                {action.status === "soon" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.common.soon}
                  </span>
                ) : (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-gold-text">
                    {t.common.ready}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {t.common[action.labelKey]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t.common[action.descriptionKey]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}