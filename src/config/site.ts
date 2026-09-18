export const siteConfig = {
  name: "Sanoori Trading",
  tagline: "Sanitary Ware, Tiles & Building Materials",
  description:
    "Sanoori Trading supplies sanitary ware, tiles, and building materials in Bangladesh.",
  url: "https://sanooritrading.com",
} as const;

export const businessConfig = {
  name: "Sanoori Trading",
  phone: "[BUSINESS PHONE]",
  whatsapp: "[WHATSAPP NUMBER]",
  email: "[BUSINESS EMAIL]",
  address: "[BUSINESS ADDRESS]",
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
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ] as const,
  cta: {
    label: "Request a Quote",
    href: "/request-quote",
  },
} as const;
