import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getHomeShowcaseProducts } from "@/lib/public/catalogue";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

const SHOWCASE_PRODUCT_COUNT = 8;

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

/**
 * Home page product showcase.
 *
 * Always shows a curated selection of real active products (preferring ones
 * with photographs) instead of depending on admin "featured" flags — so the
 * section never disappears when no product happens to be featured. No fake
 * prices, ratings, or popularity claims; the primary action flows through the
 * existing request-quote (and WhatsApp-when-configured) pipeline.
 */
export async function ProductShowcase() {
  const lang = await getLang();
  const products = await getHomeShowcaseProducts(SHOWCASE_PRODUCT_COUNT);
  const t = getServerTranslations(lang);

  return (
    <section className="section-spacing bg-muted/40">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow={t.productShowcase.eyebrow}
            title={t.productShowcase.title}
            description={t.productShowcase.description}
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.06} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t.productShowcase.seeFullCatalogue}
            </p>
            <ButtonLink href="/products" variant="primary" size="lg">
              {t.productShowcase.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}