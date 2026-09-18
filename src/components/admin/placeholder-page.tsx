import { EmptyState } from "@/components/shared/empty-state";

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoonDescription: string;
  icon: React.ReactNode;
}

export function PlaceholderPage({
  title,
  description,
  comingSoonDescription,
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <EmptyState
          title="Coming in a later step"
          description={comingSoonDescription}
          icon={icon}
        />
      </div>
    </div>
  );
}