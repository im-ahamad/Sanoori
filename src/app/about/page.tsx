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
    title: "Good quality",
    description:
      "We keep to products that are durable and made to last.",
  },
  {
    title: "Clear answers",
    description:
      "Clear information on products, availability, and prices — no confusion.",
  },
  {
    title: "On-time delivery",
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
        backgroundImage="/images/about-hero.png"
        unoptimized
        objectFit="object-contain"
        backdropOverlay="bg-[radial-gradient(ellipse_125%_80%_at_16%_-18%,color-mix(in_oklab,var(--navy-dark)_78%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_32%,transparent_78%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_90%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_80%,transparent)_20%,color-mix(in_oklab,var(--navy-dark)_60%,transparent)_44%,color-mix(in_oklab,var(--navy-dark)_36%,transparent)_66%,color-mix(in_oklab,var(--navy-dark)_14%,transparent)_84%,transparent_98%)]"
        placement="top-left"
        textColor="pureWhite"
        className="min-h-[calc(100vw/3)]"
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
                  Sanoori Trading supplies sanitary ware, tiles, and building
                  materials in Bangladesh. From a single item to a full
                  project, we help you find the products you need.
                </p>
                <p>
                  Our focus is simple: good products, clear information, and
                  reliable delivery — so we are easy to buy from, again and
                  again.
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
                Our products are organised into these categories:
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
                    className="rounded-lg border border-border bg-card p-5 shadow-sm"
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
            <div className="mx-auto mt-14 max-w-3xl rounded-lg border border-border bg-muted/40 p-6 text-center shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Need a product or a price?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Tell us what you are looking for and we will help you find it.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonLink href="/products">See Products</ButtonLink>
                <ButtonLink href="/request-quote" variant="outline">
                  Get a Price
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