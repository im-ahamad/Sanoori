import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

interface ClosingCatalogueCardProps {
  totalProductCount: number;
}

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Full-width closing catalogue card before footer.
 * Shows total product count and primary/secondary CTAs.
 */
export async function ClosingCatalogueCard({ totalProductCount }: ClosingCatalogueCardProps) {
  const lang = await getLang();
  const t = getServerTranslations(lang);

  return (
    <section className="section-spacing bg-background" aria-labelledby="catalogue-closing-heading">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden bg-white border border-border rounded-2xl p-8 lg:p-12">
            {/* Subtle decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2
                  id="catalogue-closing-heading"
                  className="font-heading text-2xl lg:text-3xl font-semibold tracking-tight text-foreground"
                >
                  {t.productShowcase.seeFullCatalogue.replace("See the full catalogue with search, filters, and every category.", "Browse the complete catalogue")}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {totalProductCount > 0
                    ? `Explore all ${totalProductCount} products across sanitary ware, tiles, and building materials.`
                    : "Explore our complete range of sanitary ware, tiles, and building materials."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 lg:ml-8 lg:shrink-0">
                <ButtonLink
                  href="/products"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                >
                  {t.productShowcase.cta}
                  <ArrowRight className="size-4 ml-2" aria-hidden="true" />
                </ButtonLink>

                {/* Secondary action - contact/quote route */}
                <ButtonLink
                  href="/request-quote"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                >
                  {t.common.requestQuote}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}