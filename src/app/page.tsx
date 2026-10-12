import type { Metadata } from "next";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { Hero } from "@/components/home/hero";
import { ProductCatalogue } from "@/components/home/product-catalogue";
import { generateOrganizationSchema } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";


async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
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

export default async function Home() {
  const organizationSchema = JSON.stringify(generateOrganizationSchema());

  return (
    <main className="flex-1 relative">
      <Hero />
      <CategoryShowcase />
      <ProductCatalogue />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
    </main>
  );
}