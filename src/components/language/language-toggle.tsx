"use client";

import { cn } from "@/lib/utils";
import {
  languageMeta,
  useLanguage,
  type SupportedLanguage,
} from "@/lib/language";

interface LanguageToggleProps {
  variant?: "header" | "panel";
  className?: string;
}

export function LanguageToggle({
  variant = "header",
  className,
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "panel") {
    return (
      <div className={cn("flex items-center gap-2", className)} role="group" aria-label="Language">
        {(["en", "bn"] as SupportedLanguage[]).map((lang) => {
          const active = language === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              aria-pressed={active}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {languageMeta[lang].nativeLabel}
            </button>
          );
        })}
      </div>
    );
  }

  const isEn = language === "en";
  const nextLang = isEn ? "bn" : "en";
  const nextLabel = isEn ? "বাংলা" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLang)}
      aria-label={`Current: ${languageMeta[language].label}. Click to switch to ${languageMeta[nextLang].label}`}
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded border border-border bg-background",
        "transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-w-[64px]",
        className
      )}
    >
      {nextLabel}
    </button>
  );
}