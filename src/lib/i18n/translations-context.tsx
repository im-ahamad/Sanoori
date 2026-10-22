"use client";

import { createContext, useContext, useMemo } from "react";
import type { Dictionary } from "./dictionary-types";

/**
 * Holds the active-language dictionary as React context data.
 *
 * The dictionary is selected on the server (from the `sanoori-lang` cookie) and
 * passed down as a prop, so only the active language ever reaches the client
 * bundle and the client payload. The inactive dictionary is never imported by
 * client code, which keeps it out of the shared client chunks entirely.
 *
 * Language switching updates the cookie and calls `router.refresh()`
 * (`LanguageRefreshHandler`), causing the server to re-render with the newly
 * selected dictionary — the context value always matches the rendered language,
 * so there is no window where a component sees a missing or stale dictionary.
 */

interface TranslationsContextValue {
  dictionary: Dictionary;
}

const TranslationsContext = createContext<TranslationsContextValue | null>(null);

export function TranslationsProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<TranslationsContextValue>(
    () => ({ dictionary }),
    [dictionary]
  );
  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslationsDictionary(): Dictionary {
  const ctx = useContext(TranslationsContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within TranslationsProvider");
  }
  return ctx.dictionary;
}
