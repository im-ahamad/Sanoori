"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydration from localStorage requires sync state init in effect */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Minimal extensible language state.
 *
 * - Default is Bangla ("bn") — primary language for Bangladeshi users.
 * - "en" (English) is a persisted selection state for international users.
 * - Persisted in localStorage; <html lang> is updated client-side.
 */

export type SupportedLanguage = "en" | "bn";

const STORAGE_KEY = "sanoori-lang";

export const languageMeta: Record<
  SupportedLanguage,
  { label: string; shortLabel: string; htmlLang: string; nativeLabel: string }
> = {
  en: { label: "English", shortLabel: "EN", htmlLang: "en", nativeLabel: "EN" },
  bn: { label: "বাংলা", shortLabel: "BN", htmlLang: "bn", nativeLabel: "বাংলা" },
};

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "en" || value === "bn";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("bn");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) {
      setLanguageState(stored);
      document.documentElement.lang = languageMeta[stored].htmlLang;
    } else {
      // Default to Bangla for Bangladeshi users on first load
      const current = document.documentElement.lang;
      if (current === "en") setLanguageState("en");
    }
  }, []);

  const setLanguage = useCallback((next: SupportedLanguage) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = languageMeta[next].htmlLang;
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
