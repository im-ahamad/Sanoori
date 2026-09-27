import { Container } from "@/components/layout/container";
import { getPublicCategories } from "@/lib/public/catalogue";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/shared/reveal";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function CategoryGrid() {
  const lang = await getLang();
  const categories = await getPublicCategories();
  const t = getServerTranslations(lang);

  return (
    <section className="section-spacing bg-background">
      <Container>
        {/* Editorial intro header - desktop: 2-col grid, mobile: stacked */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-gold-text">
                <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                {t.categoryGrid.eyebrow}
              </p>
              <h2 className="mt-3 font-heading font-bold leading-tight tracking-tight text-foreground clamp-text-3xl-5xl">
                {t.categoryGrid.title}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pl-12">
            <Reveal delay={0.1}>
              <p className="max-w-[38rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.categoryGrid.description}
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