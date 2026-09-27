"use client";

import { useLanguage, type SupportedLanguage } from "@/lib/language";
import { adminEn } from "./dictionaries/admin/en";
import { adminBn } from "./dictionaries/admin/bn";

type Widen<T> = {
  [K in keyof T]: T[K] extends object ? Widen<T[K]> : string;
};

type AdminCommon = Widen<typeof adminEn.common>;

type AdminDictionary = {
  common: AdminCommon;
};

const adminDictionaries: Record<SupportedLanguage, AdminDictionary> = {
  en: adminEn,
  bn: adminBn,
} as const satisfies Record<SupportedLanguage, AdminDictionary>;

export function useAdminTranslations(): AdminDictionary {
  const { language } = useLanguage();
  return adminDictionaries[language];
}

export function getAdminTranslations(lang: SupportedLanguage): AdminDictionary {
  return adminDictionaries[lang];
}

export type { AdminDictionary, SupportedLanguage };