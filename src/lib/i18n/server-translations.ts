import { en } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";
import { adminEn } from "./dictionaries/admin/en";
import { adminBn } from "./dictionaries/admin/bn";

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
type ProductDetails = Widen<typeof en.productDetails>;
type PrivacyPolicy = Widen<typeof en.privacyPolicy>;
type ContactPage = Widen<typeof en.contactPage>;
type About = Widen<typeof en.about>;
type Seo = Widen<typeof en.seo>;
type Categories = Widen<typeof en.categories>;
type Contact = Widen<typeof en.contact>;
type RequestQuote = Widen<typeof en.requestQuote>;

type AdminCommon = Widen<typeof adminEn.common>;

type AdminDictionary = {
  common: AdminCommon;
};

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
  productDetails: ProductDetails;
  privacyPolicy: PrivacyPolicy;
  contactPage: ContactPage;
  about: About;
  seo: Seo;
  categories: Categories;
  contact: Contact;
  requestQuote: RequestQuote;
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
    name: "Sanoori Trading",
    tagline: t.mobileNav.tagline,
    description: t.footer.description,
    url: "https://sanooritrading.com",
  } as const;
}