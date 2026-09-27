"use client";

import { useLanguage, type SupportedLanguage } from "@/lib/language";
import { en } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";

// Helper to widen literal string types to string
type Widen<T> = {
  [K in keyof T]: T[K] extends object ? Widen<T[K]> : string;
};

type Common = Widen<typeof en.common>;
type Header = Widen<typeof en.header>;
type Hero = Widen<typeof en.hero>;
type CategoryGrid = Widen<typeof en.categoryGrid>;
type ProductShowcase = Widen<typeof en.productShowcase>;
type CustomerJourney = Widen<typeof en.customerJourney>;
type CtaBand = Widen<typeof en.ctaBand>;
type DiscoveryCta = Widen<typeof en.discoveryCta>;
type Footer = Widen<typeof en.footer>;
type CategoryCard = Widen<typeof en.categoryCard>;
type MobileNav = Widen<typeof en.mobileNav>;
type LanguageToggle = Widen<typeof en.languageToggle>;
type Layout = Widen<typeof en.layout>;
type ThemeToggle = Widen<typeof en.themeToggle>;
type Products = Widen<typeof en.products>;
type About = Widen<typeof en.about>;
type Seo = Widen<typeof en.seo>;
type Categories = Widen<typeof en.categories>;
type Contact = Widen<typeof en.contact>;
type RequestQuote = Widen<typeof en.requestQuote>;

type Dictionary = {
  common: Common;
  header: Header;
  hero: Hero;
  categoryGrid: CategoryGrid;
  productShowcase: ProductShowcase;
  customerJourney: CustomerJourney;
  ctaBand: CtaBand;
  discoveryCta: DiscoveryCta;
  footer: Footer;
  categoryCard: CategoryCard;
  mobileNav: MobileNav;
  languageToggle: LanguageToggle;
  layout: Layout;
  themeToggle: ThemeToggle;
  products: Products;
  about: About;
  seo: Seo;
  categories: Categories;
  contact: Contact;
  requestQuote: RequestQuote;
};

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en,
  bn,
} as const satisfies Record<SupportedLanguage, Dictionary>;

export function useTranslations(): Dictionary {
  const { language } = useLanguage();
  return dictionaries[language];
}

export function getTranslations(lang: SupportedLanguage): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary, SupportedLanguage };