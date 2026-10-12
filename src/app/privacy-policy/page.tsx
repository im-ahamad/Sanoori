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
    <main className="flex-1 relative sanoori-privacy-page">
      <PageHeader
        title={pp.headerTitle}
        description={pp.headerDescription}
        breadcrumbs={[{ label: pp.breadcrumb, href: "/privacy-policy" }]}
        backgroundImage="/images/privecy-hero.png"
        backdropOverlay="bg-black/20"
        // The hero section is sized to the image's exact ratio (see
        // `.sanoori-privacy-hero` in globals.css), so `object-contain`
        // renders the complete 1944×809 photo — never cropped — while the
        // ambient backdrop zoom (which would crop it) is off via `noZoom`.
        objectFit="object-contain"
        objectPosition="object-center"
        noZoom
        className="sanoori-privacy-hero"
      />

      <div className="section-spacing">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground">
                {pp.lastUpdated}
              </p>

              <div className="mt-5 space-y-8 sm:mt-6 sm:space-y-12">
                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.introduction.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.introduction.body1}</p>
                    <p>{sections.introduction.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.informationWeCollect.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.informationWeCollect.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.informationWeCollect.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.howWeUseInformation.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.howWeUseInformation.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.howWeUseInformation.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.contactAndInquiry.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.contactAndInquiry.body1}</p>
                    <p>{sections.contactAndInquiry.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.cookiesAndWebsiteUsage.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.cookiesAndWebsiteUsage.body1}</p>
                    <p>{sections.cookiesAndWebsiteUsage.body2}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.thirdPartyServices.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.thirdPartyServices.body}</p>
                    <ul className="ml-4 list-disc space-y-2">
                      {sections.thirdPartyServices.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.dataSecurity.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.dataSecurity.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.dataRetention.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.dataRetention.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.yourRights.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.yourRights.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {sections.changes.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:space-y-4 sm:text-base">
                    <p>{sections.changes.body}</p>
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {pp.contactUs.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
                    {pp.contactUs.body}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
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