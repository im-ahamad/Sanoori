import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { generatePageMetadata } from "@/lib/seo";
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
  const pp = t.privacyPolicy;
  return generatePageMetadata({
    title: pp.pageTitle,
    description: pp.pageDescription,
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage() {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const pp = t.privacyPolicy;
  const sections = pp.sections;

  return (
    <main className="flex-1">
      <PageHeader
        title={pp.headerTitle}
        description={pp.headerDescription}
        breadcrumbs={[{ label: pp.breadcrumb, href: "/privacy-policy" }]}
      />

      <div className="section-spacing">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground">
                {pp.lastUpdated}
              </p>

              <div className="mt-6 space-y-12">
                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.introduction.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.introduction.body1}</p>
                    <p>{sections.introduction.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.informationWeCollect.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.informationWeCollect.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.informationWeCollect.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.howWeUseInformation.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.howWeUseInformation.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.howWeUseInformation.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.contactAndInquiry.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.contactAndInquiry.body1}</p>
                    <p>{sections.contactAndInquiry.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.cookiesAndWebsiteUsage.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.cookiesAndWebsiteUsage.body1}</p>
                    <p>{sections.cookiesAndWebsiteUsage.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.thirdPartyServices.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.thirdPartyServices.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.thirdPartyServices.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.dataSecurity.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.dataSecurity.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.dataRetention.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.dataRetention.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.yourRights.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.yourRights.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.changes.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <p>{sections.changes.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {pp.contactUs.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {pp.contactUs.body}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href="/contact">{pp.contactUs.contactButton}</ButtonLink>
                    <ButtonLink href="/products" variant="outline">
                      {pp.contactUs.seeProductsButton}
                    </ButtonLink>
                  </div>
                </section>
              </div>
            </div>
          </Reveal>
        </Container>
      </div>
    </main>
  );
}