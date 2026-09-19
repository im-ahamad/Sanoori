import { getPublicCategories } from "@/lib/public/catalogue";
import { CategoryCard } from "@/components/products/category-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

export async function CategoryGrid() {
  const categories = await getPublicCategories();

  return (
    <section className="section-spacing bg-background">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            title="Explore our products"
            description="Sanitary ware, tiles, and building materials — organised into categories that link straight to the live catalogue."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {categories.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.1} className="h-full">
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}