import { siteConfig } from "@/config/site";
import { en } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";
import { adminEn } from "./dictionaries/admin/en";
import { adminBn } from "./dictionaries/admin/bn";
import type { Dictionary } from "./dictionary-types";

export type { Dictionary };

// Helper to widen literal string types to string
type Widen<T> = {
  [K in keyof T]: T[K] extends object ? Widen<T[K]> : string;
};

type AdminCommon = Widen<typeof adminEn.common>;

type AdminDictionary = {
  common: AdminCommon;
};

const dictionaries: Record<"en" | "bn", Dictionary> = {
  en,
  bn,
} as const satisfies Record<"en" | "bn", Dictionary>;

const adminDictionaries: Record<"en" | "bn", AdminDictionary> = {
  en: adminEn,
  bn: adminBn,
} as const satisfies Record<"en" | "bn", AdminDictionary>;

export function getServerTranslations(lang: "en" | "bn" = "en"): Dictionary {
  return dictionaries[lang];
}

/**
 * Synchronous dictionary accessor for server-side rendering.
 *
 * Client components receive the active dictionary through `TranslationsProvider`
 * (see `./translations-context`); this server-only accessor is the equivalent for
 * Server Components and server-side utilities. Kept as the canonical
 * `getTranslations` name for API compatibility.
 */
export const getTranslations = getServerTranslations;

export function getServerAdminTranslations(lang: "en" | "bn" = "en"): AdminDictionary {
  return adminDictionaries[lang];
}

export function getNavigationConfig(lang: "en" | "bn" = "en") {
  const t = getServerTranslations(lang);
  return {
    main: [
      { label: t.header.navigation.home, href: "/" },
      { label: t.header.navigation.about, href: "/about" },
      { label: t.header.navigation.products, href: "/products" },
      { label: t.header.navigation.contact, href: "/contact" },
    ] as const,
    cta: {
      label: t.header.cta,
      href: "/products",
    },
  } as const;
}

export function getSiteConfig(lang: "en" | "bn" = "en") {
  const t = getServerTranslations(lang);
  return {
    name: siteConfig.name,
    tagline: t.mobileNav.tagline,
    description: t.footer.description,
    url: siteConfig.url,
  } as const;
}