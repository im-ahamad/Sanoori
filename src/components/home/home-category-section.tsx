import { Container } from "@/components/layout/container";
import { getPublicCategories } from "@/lib/public/catalogue";
import { HomeCategoryCard } from "@/components/home/home-category-card";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * Home page category section.
 * Displays exactly 3 category cards (Sanitary Ware, Tiles, Building Materials)
 * with ONLY image and name — no buttons, descriptions, or extra text.
 */
export async function HomeCategorySection() {
  const categories = await getPublicCategories();

  // Filter to exactly the three main categories in the correct order
  const categoryOrder = ["sanitary-ware", "tiles", "building-materials"] as const;
  const orderedCategories = categoryOrder
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[0] => c !== undefined);

  return (
    <section className="section-spacing bg-background">
      <Container>
        {/* Section headers — exact text as specified */}
        <Reveal>
          <SectionHeader
            eyebrow="Explore our products"
            title="A selection from our catalogue"
            align="left"
          />
        </Reveal>

        {/* Responsive 3-card grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {orderedCategories.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.1} className="h-full">
              <HomeCategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}