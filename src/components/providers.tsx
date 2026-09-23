"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/lib/language";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
