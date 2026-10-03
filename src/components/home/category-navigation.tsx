import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/shared/reveal";
import type { PublicCategory } from "@/lib/public/catalogue";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

interface CategoryNavigationProps {
  categories: PublicCategory[];
}

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Compact desktop-only category navigation row.
 * Links jump to category sections below via anchor links.
 * Only visible at lg (1024px) and above.
 */
export async function CategoryNavigation({ categories }: CategoryNavigationProps) {
  const lang = await getLang();
  const t = getServerTranslations(lang);

  return (
    <nav
      className="hidden lg:block"
      aria-label="Category quick navigation"
      role="navigation"
    >
      <Container>
        <Reveal delay={0.1}>
          <div className="flex items-center justify-center gap-6 lg:gap-8 py-6 border-y border-border/50">
            {categories.map((category, index) => {
              const translatedName =
                t.categories[category.slug as keyof typeof t.categories] ?? category.name;
              return (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  aria-label={`Jump to ${translatedName}`}
                >
                  {translatedName}
                  {category._count?.products && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ({category._count.products})
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </nav>
  );
}