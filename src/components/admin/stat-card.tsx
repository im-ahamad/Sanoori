import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">
        {value.toLocaleString()}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}