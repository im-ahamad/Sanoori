"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  languageMeta,
  useLanguage,
  type SupportedLanguage,
} from "@/lib/language";
import { useTranslations } from "@/lib/i18n";

interface LanguageToggleProps {
  variant?: "header" | "panel";
  className?: string;
}

export function LanguageToggle({
  variant = "header",
  className,
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (variant === "panel") {
    return (
      <div
        ref={menuRef}
        className={cn("flex items-center gap-2", className)}
        role="group"
        aria-label={t.languageToggle.label}
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Languages className="size-3.5" aria-hidden="true" />
          {t.languageToggle.label}
        </span>
        <div
          className="ml-auto inline-flex items-center rounded-full border border-border bg-muted/40 p-1"
          role="group"
          aria-label={t.languageToggle.options}
        >
          {(["en", "bn"] as SupportedLanguage[]).map((lang) => {
            const active = language === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-label={t.languageToggle.switchTo.replace("{language}", languageMeta[lang].label)}
                aria-pressed={active}
                title={languageMeta[lang].label}
                className={cn(
                  "inline-flex h-11 min-h-11 min-w-[56px] items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {languageMeta[lang].nativeLabel}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header: compact pill that toggles EN ↔ বাংলা, plus an explicit menu on demand.
  // Matches ThemeToggle's border/background/foreground treatment so they feel like a pair.
  const isEn = language === "en";
  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setLanguage(isEn ? "bn" : "en")}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen((o) => !o);
        }}
        aria-label={t.languageToggle.currentLanguage
          .replace("{current}", languageMeta[language].label)
          .replace("{target}", isEn ? "বাংলা" : "English")}
        title={`${languageMeta[language].label} — click to switch, right-click for options`}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-semibold text-foreground",
          "shadow-sm transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none"
        )}
      >
        <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-[36px] text-center tracking-wide">
          {languageMeta[language].nativeLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={t.languageToggle.options}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:top-full focus:mt-2 focus:-translate-x-1/2 focus:rounded-md focus:bg-popover focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-popover-foreground focus:shadow-md"
      >
        {t.languageToggle.options}
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label={t.languageToggle.options}
          className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-border bg-popover p-1.5 shadow-lg"
        >
          {(["en", "bn"] as SupportedLanguage[]).map((lang) => {
            const active = language === lang;
            return (
              <button
                key={lang}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLanguage(lang);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full border text-xs font-bold",
                      active
                        ? "border-gold/30 bg-background text-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {languageMeta[lang].shortLabel}
                  </span>
                  {languageMeta[lang].label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {languageMeta[lang].nativeLabel}
                </span>
              </button>
            );
          })}
          <p className="px-3 pb-1 pt-2 text-xs leading-relaxed text-muted-foreground">
            {t.languageToggle.comingSoon}
          </p>
        </div>
      )}
    </div>
  );
}
