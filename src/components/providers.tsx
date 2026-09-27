"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/lib/language";
import { LanguageRefreshHandler } from "@/components/language/language-refresh-handler";

export function Providers({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: "en" | "bn";
}) {
  return (
    <ThemeProvider>
      <LanguageProvider initialLanguage={initialLanguage}>
        <LanguageRefreshHandler />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
