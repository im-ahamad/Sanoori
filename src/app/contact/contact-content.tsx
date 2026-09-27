"use client";

import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ButtonLink } from "@/components/ui/button-link";
import { getConfiguredContactChannels } from "@/lib/contact-channels";
import { isConfigPlaceholder } from "@/lib/config";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { useTranslations } from "@/lib/i18n";
import type { PublicBusinessSettings } from "@/lib/public/settings";

interface ContactPageContentProps {
  businessSettings: PublicBusinessSettings;
}

export function ContactPageContent({ businessSettings }: ContactPageContentProps) {
  const t = useTranslations();
  const configuredChannels = getConfiguredContactChannels(businessSettings);
  const channelsAvailable = configuredChannels.length > 0;
  const showAddress = !isConfigPlaceholder(businessSettings.address);

  const contact = t.contact as {
    pageTitle: string;
    pageDescription: string;
    breadcrumb: string;
    contactDirectly: {
      title: string;
      description: string;
      comingSoon: string;
      browseProducts: string;
      visitUs: string;
    };
    projectPrices: {
      title: string;
      description: string;
      browseProducts: string;
    };
    askAnything: {
      title: string;
      description: string;
      responseTime: string;
    };
  };

  return (
    <main className="flex-1">
      <PageHeader
        title={contact.pageTitle}
        description={contact.pageDescription}
        breadcrumbs={[{ label: contact.breadcrumb, href: "/contact" }]}
        breadcrumbLinkClassName="text-[1rem] transition-colors duration-200 hover:text-gold-light"
        backgroundImage="/images/contact-hero.png"
        backdropOverlay="bg-[radial-gradient(ellipse_120%_75%_at_50%_-15%,color-mix(in_oklab,var(--navy-dark)_74%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_52%,transparent)_30%,transparent_72%),linear-gradient(180deg,color-mix(in_oklab,var(--navy-dark)_92%,transparent)_0%,color-mix(in_oklab,var(--navy-dark)_82%,transparent)_22%,color-mix(in_oklab,var(--navy-dark)_64%,transparent)_44%,color-mix(in_oklab,var(--navy-dark)_40%,transparent)_64%,color-mix(in_oklab,var(--navy-dark)_16%,transparent)_84%,transparent_98%)]"
        objectFit="object-contain"
        noZoom
        textColor="pureWhite"
        exactCenter
        className="min-h-[calc(100vw/3)]"
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {contact.contactDirectly.title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              {contact.contactDirectly.description}
            </p>

            <div className="mt-8">
              {channelsAvailable ? (
                <ContactChannels channels={configuredChannels} />
              ) : (
                <div className="rounded-lg border border-border bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
                  {contact.contactDirectly.comingSoon}
                </div>
              )}
            </div>

            {!channelsAvailable && (
              <div className="mt-6">
                <ButtonLink href="/products" variant="primary">
                  {contact.contactDirectly.browseProducts}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            )}

            {showAddress && (
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block font-heading text-base font-semibold text-foreground">
                    {contact.contactDirectly.visitUs}
                  </span>
                  <span className="mt-1 block">
                    {businessSettings.address}
                    {!isConfigPlaceholder(businessSettings.city) &&
                      `, ${businessSettings.city}${!isConfigPlaceholder(businessSettings.country) ? `, ${businessSettings.country}` : ""}`}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-lg bg-navy-dark/90 p-6 text-white sm:p-8">
              <VisualBackdrop variant="band" objectPosition="object-top" />
              <div className="relative">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                {contact.projectPrices.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {contact.projectPrices.description}
              </p>
              <ButtonLink
                href="/products"
                variant="inverse"
                className="mt-6 w-full sm:w-auto"
              >
                {contact.projectPrices.browseProducts}
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-card p-6">
              <h2 className="font-heading text-base font-semibold text-foreground">
                {contact.askAnything.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {contact.askAnything.description}
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageCircle className="size-4 text-primary" aria-hidden="true" />
                {contact.askAnything.responseTime}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}