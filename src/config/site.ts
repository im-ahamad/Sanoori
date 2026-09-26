export const siteConfig = {
  name: "Sanoori Trading",
  tagline: "Sanitary Ware, Tiles & Building Materials",
  description:
    "Sanoori Trading supplies sanitary ware, tiles, and building materials in Bangladesh.",
  url: "https://sanooritrading.com",
} as const;

export const businessConfig = {
  name: "Sanoori Trading",
  /** Brand logo asset served from /public; alt text doubles as the fallback. */
  logo: {
    src: "/images/logo.svg",
    alt: "Sanoori Trading",
  },
  phone: "[BUSINESS PHONE]",
  whatsapp: "01933323522",
  email: "[BUSINESS EMAIL]",
  address: "Abu Taher Super Market, Dhanikhola Road, Sanoori Trading",
  city: "[BUSINESS CITY]",
  country: "Bangladesh",

  social: {
    facebook: "[FACEBOOK URL]",
    instagram: "[INSTAGRAM URL]",
    telegram: "[TELEGRAM URL]",
    tiktok: "[TIKTOK URL]",
    youtube: "[YOUTUBE URL]",
  },

  maps: {
    googleMapsEmbed: "[GOOGLE MAPS EMBED URL]",
    googleMapsLink: "[GOOGLE MAPS LINK]",
  },

  analytics: {
    gaMeasurementId: "[GA MEASUREMENT ID]",
  },
} as const;

export const navigationConfig = {
  main: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Contact", href: "/contact" },
  ] as const,
  cta: {
    label: "Browse Products",
    href: "/products",
  },
} as const;
