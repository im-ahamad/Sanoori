"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

interface ThemeToggleProps {
  variant?: "header" | "panel";
  className?: string;
}

export function ThemeToggle({
  variant = "header",
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const t = useTranslations();

  const ariaLabel = isDark ? t.themeToggle.switchToLight : t.themeToggle.switchToDark;
  const title = isDark ? t.themeToggle.light : t.themeToggle.dark;

  if (variant === "panel") {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        role="group"
        aria-label={t.themeToggle.label}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.themeToggle.label}
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={ariaLabel}
          title={title}
          className={cn(
            "ml-auto inline-flex h-11 min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground",
            "shadow-sm transition-colors hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none"
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted">
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </span>
          {isDark ? t.themeToggle.dark : t.themeToggle.light}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground",
        "shadow-sm transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
        className
      )}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
