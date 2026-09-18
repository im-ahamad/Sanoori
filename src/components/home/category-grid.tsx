import { getActiveCategories } from "@/data/categories";
import { CategoryCard } from "@/components/products/category-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

export function CategoryGrid() {
  const categories = getActiveCategories();

  return (
    <section className="section-spacing bg-background">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            title="What we supply"
            description="Three core product lines, sourced and supplied for builders, contractors, and homeowners."
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