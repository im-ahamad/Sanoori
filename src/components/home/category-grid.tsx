import { Container } from "@/components/layout/container";
import { getPublicCategories } from "@/lib/public/catalogue";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/shared/reveal";

export async function CategoryGrid() {
  const categories = await getPublicCategories();

  return (
    <section className="bg-background py-20 sm:py-28">
      <Container>
        {/* Editorial intro header - desktop: 2-col grid, mobile: stacked */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-gold">
                <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                Explore Categories
              </p>
              <h2 className="mt-3 font-heading font-semibold tracking-tight text-foreground clamp-text-3xl-5xl">
                Find What Your Space Needs
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pl-12">
            <Reveal delay={0.1}>
              <p className="max-w-[38rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
                From sanitary ware and tiles to core building materials, our
                catalogue covers every surface and system. Browse by category to
                discover products that match your project&apos;s requirements.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Asymmetric category grid - 2x2 with first card spanning both rows.
        2 rows of 326px + 20px gap = 672px tall left card; right cards fill each row. */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:grid-rows-[326px_326px]">
          {categories.slice(0, 3).map((category, index) => {
            const isLead = index === 0;
            const isSecond = index === 1;

            const placement = isLead
              ? "md:col-start-1 md:row-start-1 md:row-span-2"
              : isSecond
              ? "md:col-start-2 md:row-start-1"
              : "md:col-start-2 md:row-start-2";

            return (
              <Reveal key={category.id} delay={index * 0.1} className={`h-full ${placement}`}>
                <CategoryCard category={category} featured={isLead} index={index + 1} />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}