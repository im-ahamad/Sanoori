import { en } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";

type Dictionary = typeof en;

const dictionaries: Record<"en" | "bn", Dictionary> = {
  en,
  bn,
};

export function getServerTranslations(lang: "en" | "bn" = "en"): Dictionary {
  return dictionaries[lang];
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