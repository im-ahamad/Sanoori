import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { getCategoryBySlug, getActiveCategories } from "@/data/categories";

export function generateStaticParams() {
  return getActiveCategories().map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return generatePageMetadata({
    title: category.name,
    description: category.description,
    path: `/products/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: PageProps<"/products/[category]">) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const breadcrumbSchema = JSON.stringify(
    generateBreadcrumbSchema([
      { name: "Products", url: "/products" },
      { name: category.name, url: `/products/${category.slug}` },
    ])
  );

  return (
    <main className="flex-1">
      <PageHeader
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: category.name, href: `/products/${category.slug}` },
        ]}
      />

      <Container>
        <div className="section-spacing">
          {category.subcategories.length > 0 && (
            <>
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Product types
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {sub.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Specific items within this type will be listed shortly.
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <EmptyState
            title={`Product listings coming soon`}
            description={`We currently supply this category on request. Tell us what you need and we will confirm availability, pricing, and delivery.`}
          />
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/request-quote">Request a Quote</ButtonLink>
          </div>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
    </main>
  );
}