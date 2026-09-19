import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  href?: string;
}

export function StatCard({ label, value, icon: Icon, hint, href }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">
        {value.toLocaleString()}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  const classes =
    "block rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg border border-border bg-background p-5">{content}</div>;
}