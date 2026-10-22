"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/lib/language";
import { LanguageRefreshHandler } from "@/components/language/language-refresh-handler";
import { TranslationsProvider } from "@/lib/i18n/translations-context";
import type { Dictionary } from "@/lib/i18n/dictionary-types";

export function Providers({
  children,
  initialLanguage,
  dictionary,
}: {
  children: React.ReactNode;
  initialLanguage: "en" | "bn";
  /** Active-language dictionary, selected on the server from the lang cookie. */
  dictionary: Dictionary;
}) {
  return (
    <div className="flex-1 flex-col">
      <ThemeProvider>
        <TranslationsProvider dictionary={dictionary}>
          <LanguageProvider initialLanguage={initialLanguage}>
            <LanguageRefreshHandler />
            {children}
          </LanguageProvider>
        </TranslationsProvider>
      </ThemeProvider>
    </div>
  );
}
