"use client";

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
 * - Default is English ("en") — fallback language for international users.
 * - "bn" (Bangla) is a persisted selection state for Bangladeshi users.
 * - Persisted in a cookie (readable by server and client); <html lang> is updated client-side.
 */

export type SupportedLanguage = "en" | "bn";

const COOKIE_NAME = "sanoori-lang";

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

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    const stored = getCookie(COOKIE_NAME);
    if (isSupportedLanguage(stored)) {
      const id = setTimeout(() => {
        setLanguageState(stored);
        document.documentElement.lang = languageMeta[stored].htmlLang;
      }, 0);
      return () => clearTimeout(id);
    } else {
      document.documentElement.lang = languageMeta.en.htmlLang;
    }
  }, []);

  const setLanguage = useCallback((next: SupportedLanguage) => {
    setLanguageState(next);
    setCookie(COOKIE_NAME, next);
    document.documentElement.lang = languageMeta[next].htmlLang;
    // Trigger a custom event to notify components to refresh server data
    window.dispatchEvent(new CustomEvent("sanoori-language-change"));
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
