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
  phone: "01305-229911",
  whatsapp: "01933323522",
  email: "sanoori.trading@gmail.com",
  address: "Abu Taher Super Market, Dhanikhola Road, Sanoori Trading",
  city: "Trishal Shador",
  country: "Bangladesh",

  social: {
    facebook: "",
    instagram: "",
    telegram: "",
    tiktok: "https://www.tiktok.com/@sanooori",
    youtube: "https://www.youtube.com/@sanoori_trading",
  },

  maps: {
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!4v1790487674540!6m8!1m7!1sHhEqd18imtASqq_XvXWObQ!2m2!1d24.58130454720611!2d90.38987299487287!3f329.4225369895854!4f-4.762495448524319!5f0.4000000000000002",
    googleMapsLink: "https://maps.app.goo.gl/WzEnbAoh2edt4fob8",
  },

  analytics: {
    gaMeasurementId: "",
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
