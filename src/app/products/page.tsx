import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryCard } from "@/components/products/category-card";
import { generatePageMetadata } from "@/lib/seo";
import { getActiveCategories } from "@/data/categories";

export const metadata = generatePageMetadata({
  title: "Products",
  description:
    "Explore Sanoori Trading product categories — sanitary ware, tiles, and building materials.",
  path: "/products",
});

export default function ProductsPage() {
  const categories = getActiveCategories();

  return (
    <main className="flex-1">
      <PageHeader
        title="Our Products"
        description="Shop by category — sanitary ware, tiles, and building materials for residential and commercial projects."
        breadcrumbs={[{ label: "Products", href: "/products" }]}
      />

      <Container>
        <div className="section-spacing">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}