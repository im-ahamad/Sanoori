import { getFeaturedProducts } from "@/lib/public/catalogue";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Reveal } from "@/components/shared/reveal";

/**
 * Database-driven "Featured Products" section.
 *
 * Reads from `getFeaturedProducts` (same public service + cache tag as the
 * catalogue) so admin edits and featured/unfeatured toggles keep this section
 * in sync. The whole section is hidden when no products are currently featured
 * rather than showing fake or empty content.
 */
export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section-spacing bg-muted/40">
      <div className="container-sanoori">
        <Reveal>
          <SectionHeader
            title="Featured products"
            description="A selection of products currently available through Sanoori Trading."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}