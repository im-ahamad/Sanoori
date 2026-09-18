import type { Metadata } from "next";
import { siteConfig, businessConfig } from "@/config/site";

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

export function generateProductSchema(product: {
  name: string;
  description: string;
  images: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: businessConfig.name,
    },
    images: product.images,
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessConfig.name,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: businessConfig.city,
      addressCountry: businessConfig.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: businessConfig.phone,
      contactType: "customer service",
    },
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
