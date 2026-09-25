"use client";

import { useLanguage, type SupportedLanguage } from "@/lib/language";
import { en } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";

type Dictionary = typeof en;

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en,
  bn,
};

export function useTranslations(): Dictionary {
  const { language } = useLanguage();
  return dictionaries[language];
}

export function getTranslations(lang: SupportedLanguage): Dictionary {
  return dictionaries[lang];
}