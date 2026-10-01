import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { generatePageMetadata, generateOrganizationSchema } from "@/lib/seo";
import { getCategoryIconElement } from "@/lib/category-icons";
import { getPublicCategories } from "@/lib/public/catalogue";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata(): Promise<ReturnType<typeof generatePageMetadata>> {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  return generatePageMetadata({
    title: t.about.heroTitle,
    description: t.about.heroDescription,
    path: "/about",
  });
}

export default async function AboutPage() {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const categories = await getPublicCategories();
  const organizationSchema = JSON.stringify(generateOrganizationSchema());

  return (
    <main className="flex-1">
      <PageHeader
        title={t.about.heroTitle}
        description={t.about.heroDescription}
        breadcrumbs={[{ label: t.about.breadcrumb, href: "/about" }]}
        breadcrumbLinkClassName="text-[1rem] transition-colors duration-200 hover:text-gold-light"
        backgroundImage="/images/about-hero.png"
        objectFit="object-cover lg:object-contain"
        backdropOverlay="bg-[radial-gradient(ellipse_125%_80%_at_16%_-18%,color-mix(in_oklab,var(--navy-dark)_78%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_32%,transparent_78%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_90%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_80%,transparent)_20%,color-mix(in_oklab,var(--navy-dark)_60%,transparent)_44%,color-mix(in_oklab,var(--navy-dark)_36%,transparent)_66%,color-mix(in_oklab,var(--navy-dark)_14%,transparent)_84%,transparent_98%)]"
        placement="top-left"
        textColor="pureWhite"
        className="lg:min-h-[calc(100dvh-5rem)]"
      />

      <div className="section-spacing">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.about.whoWeAre.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  {t.about.whoWeAre.p1}
                </p>
                <p>
                  {t.about.whoWeAre.p2}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.about.whatWeSupply.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {t.about.whatWeSupply.description}
              </p>
              <ul className="mt-6 space-y-4">
                {categories.map((category) => {
                  const translatedName = t.categories[category.slug as keyof typeof t.categories] ?? category.name;
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md"
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
                              {translatedName}
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
                {t.about.howWeWork.title}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {t.about.howWeWork.valueProps.map((item) => (
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
                {t.about.cta.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {t.about.cta.description}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <ButtonLink href="/products">{t.about.cta.seeProducts}</ButtonLink>
                <ButtonLink href="/products" variant="outline">
                  {t.about.cta.askForPrice}
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