import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { Features } from "@/components/home/features";
import { Process } from "@/components/home/process";
import { CtaBand } from "@/components/home/cta-band";
import { generateOrganizationSchema } from "@/lib/seo";

export default function Home() {
  const organizationSchema = JSON.stringify(generateOrganizationSchema());

  return (
    <main className="flex-1">
      <Hero />
      <CategoryGrid />
      <Features />
      <Process />
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
    </main>
  );
}