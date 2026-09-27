import type { Metadata } from "next";
import { siteConfig, businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

type OpenGraphImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function generateSiteMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      "sanitary ware",
      "tiles",
      "building materials",
      "bathroom fixtures",
      "floor tiles",
      "wall tiles",
      "Bangladesh",
      "construction materials",
      "plumbing",
      "bathroom accessories",
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...overrides,
  };
}

export function generatePageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: OpenGraphImage;
}): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: image ? [image.url] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

const PRODUCT_AVAILABILITY_SCHEMA: Record<string, string> = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  ON_REQUEST: "https://schema.org/PreOrder",
};

/**
 * schema.org Product structured data for a product detail page.
 *
 * Deliberately minimal: we sell on request so there is NO price/offers block.
 * `availability` maps our enum to Schema.org, and `itemCondition` is always
 * NewCondition (we do not sell used goods).
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  slug: string;
  images?: string[];
  productCode?: string | null;
  availability?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: businessConfig.name,
    },
    ...(product.category ? { category: product.category } : {}),
    ...(product.productCode ? { sku: product.productCode } : {}),
    ...(product.images && product.images.length > 0
      ? { image: product.images }
      : {}),
    ...(product.availability
      ? {
          availability: PRODUCT_AVAILABILITY_SCHEMA[product.availability],
          itemCondition: "https://schema.org/NewCondition",
        }
      : {}),
  };
}

/**
 * Version of `generatePageMetadata` tuned for the homepage, which uses the
 * site-wide brand title/description (mirroring `generateSiteMetadata`) while
 * adding an explicit canonical URL and Open Graph page URL.
 */
export async function generateHomeMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value === "bn" ? "bn" : "en";
  const t = getServerTranslations(lang);
  const rootUrl = `${siteConfig.url}/`;
  const title = t.seo.homeTitle;

  return {
    title,
    description: t.seo.homeDescription,
    alternates: { canonical: rootUrl },
    openGraph: {
      type: "website",
      locale: lang === "bn" ? "bn_BD" : "en_US",
      url: rootUrl,
      siteName: siteConfig.name,
      title,
      description: t.seo.homeDescription,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.seo.homeDescription,
    },
  };
}

const SOCIAL_PLACEHOLDERS: Array<[string, string]> = [
  ["facebook", businessConfig.social.facebook],
  ["instagram", businessConfig.social.instagram],
  ["telegram", businessConfig.social.telegram],
  ["tiktok", businessConfig.social.tiktok],
  ["youtube", businessConfig.social.youtube],
];

/**
 * schema.org Organization structured data for the homepage.
 *
 * Deliberately omits anything that is still a "[PLACEHOLDER]" value — address
 * and contactPoint are only emitted once real business details are configured,
 * and `sameAs` only lists real profile URLs. No invented business facts.
 */
export function generateOrganizationSchema() {
  const hasCity = !isConfigPlaceholder(businessConfig.city);
  const hasPhone = !isConfigPlaceholder(businessConfig.phone);

  const sameAs = SOCIAL_PLACEHOLDERS.filter(
    ([, value]) => !isConfigPlaceholder(value)
  ).map(([, value]) => value);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessConfig.name,
    url: siteConfig.url,
    ...(hasCity
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: businessConfig.city,
            addressCountry: businessConfig.country,
          },
        }
      : {}),
    ...(hasPhone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: businessConfig.phone,
            contactType: "customer service",
            availableLanguage: ["English", "Bengali"],
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}
