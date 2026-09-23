import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-8 bg-gold-dark" aria-hidden="true" />
          {eyebrow}
          {align === "center" && (
            <span className="h-px w-8 bg-gold-dark" aria-hidden="true" />
          )}
        </p>
      )}
      <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
