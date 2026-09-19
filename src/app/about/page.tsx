import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { generatePageMetadata, generateOrganizationSchema } from "@/lib/seo";
import { getCategoryIconElement } from "@/lib/category-icons";
import { getPublicCategories } from "@/lib/public/catalogue";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Sanoori Trading is a Bangladesh-based supplier of sanitary ware, tiles, and building materials.",
  path: "/about",
});

const valueProps = [
  {
    title: "Quality first",
    description:
      "We focus on products that are durable, dependable, and built to last.",
  },
  {
    title: "Honest guidance",
    description:
      "Clear information on products, availability, and pricing — no ambiguity.",
  },
  {
    title: "Reliable delivery",
    description:
      "Orders prepared and delivered on the schedule we agree with you.",
  },
];

export default async function AboutPage() {
  const categories = await getPublicCategories();
  const organizationSchema = JSON.stringify(generateOrganizationSchema());

  return (
    <main className="flex-1">
      <PageHeader
        title="About Sanoori Trading"
        description="A supplier of sanitary ware, tiles, and building materials in Bangladesh."
        breadcrumbs={[{ label: "About", href: "/about" }]}
      />

      <div className="section-spacing">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Who we are
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Sanoori Trading is a Bangladesh-based supplier of sanitary
                  ware, tiles, and building materials. We help builders,
                  contractors, retailers, and homeowners source the products
                  they need for residential and commercial projects.
                </p>
                <p>
                  Trade is built on trust. Our focus is on supplying quality
                  products, providing clear information, and delivering
                  reliably — so our customers can count on us order after
                  order.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                What we supply
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                We organise our business around three core product lines:
              </p>
              <ul className="mt-6 space-y-4">
                {categories.map((category) => {
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                          {getCategoryIconElement(category.slug, {
                            className: "size-5",
                            strokeWidth: 1.75,
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                              {category.name}
                            </h3>
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                How we work
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {valueProps.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mx-auto mt-14 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 text-center sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Need products or pricing?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Tell us what you are looking for and we will help you find it.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonLink href="/products">Browse Products</ButtonLink>
                <ButtonLink href="/request-quote" variant="outline">
                  Request a Quote
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
    </main>
  );
}