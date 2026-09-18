import { TriangleAlert } from "lucide-react";

interface SectionErrorProps {
  title?: string;
  description?: string;
}

export function SectionError({
  title = "Could not load data",
  description = "Something went wrong loading this section. Please try again in a moment.",
}: SectionErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-12 text-center"
    >
      <TriangleAlert
        className="size-8 text-destructive"
        aria-hidden="true"
      />
      <h3 className="mt-3 font-heading text-base font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}