import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductShowcase } from "@/components/home/product-showcase";
import { DiscoveryCta } from "@/components/home/discovery-cta";
import { CustomerJourney } from "@/components/home/customer-journey";
import { CtaBand } from "@/components/home/cta-band";
import { generateHomeMetadata, generateOrganizationSchema } from "@/lib/seo";

export const metadata: Metadata = generateHomeMetadata();

export default async function Home() {
  const organizationSchema = JSON.stringify(generateOrganizationSchema());

  return (
    <main className="flex-1">
      <Hero />
      <CategoryGrid />
      <ProductShowcase />
      <CustomerJourney />
      <DiscoveryCta />
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
    </main>
  );
}