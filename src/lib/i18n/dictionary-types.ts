import type { en } from "./dictionaries/en";

/**
 * Shared, runtime-free dictionary types.
 *
 * `import type` is erased at build time, so this module never pulls the English
 * (or Bangla) dictionary into any client bundle — it only exists so both the
 * server (`server-translations.ts`) and the client context
 * (`translations-context.tsx`) describe the same shape.
 *
 * The `Widen` helper keeps the shape but widens literal string types to `string`,
 * so the Bangla dictionary (which has different literal values) satisfies it.
 */
type Widen<T> = {
  [K in keyof T]: T[K] extends object ? Widen<T[K]> : string;
};

export type Common = Widen<typeof en.common>;
export type Header = Widen<typeof en.header>;
export type Hero = Widen<typeof en.hero>;
export type CategoryGrid = Widen<typeof en.categoryGrid>;
export type CategoryShowcase = Widen<typeof en.categoryShowcase>;
export type ProductShowcase = Widen<typeof en.productShowcase>;
export type CustomerJourney = Widen<typeof en.customerJourney>;
export type CtaBand = Widen<typeof en.ctaBand>;
export type DiscoveryCta = Widen<typeof en.discoveryCta>;
export type Footer = Widen<typeof en.footer>;
export type CategoryCard = Widen<typeof en.categoryCard>;
export type MobileNav = Widen<typeof en.mobileNav>;
export type LanguageToggle = Widen<typeof en.languageToggle>;
export type Layout = Widen<typeof en.layout>;
export type ThemeToggle = Widen<typeof en.themeToggle>;
export type Products = Widen<typeof en.products>;
export type ProductDetails = Widen<typeof en.productDetails>;
export type PrivacyPolicy = Widen<typeof en.privacyPolicy>;
export type ContactPage = Widen<typeof en.contactPage>;
export type About = Widen<typeof en.about>;
export type Seo = Widen<typeof en.seo>;
export type Categories = Widen<typeof en.categories>;
export type Contact = Widen<typeof en.contact>;
export type RequestQuote = Widen<typeof en.requestQuote>;

export type Dictionary = {
  common: Common;
  header: Header;
  hero: Hero;
  categoryGrid: CategoryGrid;
  categoryShowcase: CategoryShowcase;
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
