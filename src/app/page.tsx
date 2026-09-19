import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { DiscoveryCta } from "@/components/home/discovery-cta";
import { Features } from "@/components/home/features";
import { HowToBuy } from "@/components/home/how-to-buy";
import { CtaBand } from "@/components/home/cta-band";
import { generateHomeMetadata, generateOrganizationSchema } from "@/lib/seo";
import { getPublicCategories } from "@/lib/public/catalogue";

export const metadata: Metadata = generateHomeMetadata();

export default async function Home() {
  const organizationSchema = JSON.stringify(generateOrganizationSchema());
  const categories = await getPublicCategories();

  return (
    <main className="flex-1">
      <Hero categories={categories} />
      <CategoryGrid />
      <FeaturedProducts />
      <DiscoveryCta />
      <Features />
      <HowToBuy />
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
    </main>
  );
}