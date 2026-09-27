import Link from "next/link";
import {
  MessagesSquare,
  Package,
  PackagePlus,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "ready" | "soon";
}

const actions: QuickAction[] = [
  {
    label: "Add Product",
    description: "Create a new product listing.",
    href: "/admin/products/new",
    icon: PackagePlus,
    status: "ready",
  },
  {
    label: "View Products",
    description: "Browse, search, and manage the catalogue.",
    href: "/admin/products",
    icon: Package,
    status: "ready",
  },
  {
    label: "View Inquiries",
    description: "Review customer quote requests.",
    href: "/admin/inquiries",
    icon: MessagesSquare,
    status: "ready",
  },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="font-heading text-base font-bold tracking-tight text-foreground"
      >
        Quick actions
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                {action.status === "soon" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Soon
                  </span>
                ) : (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-gold-text">
                    Ready
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {action.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}