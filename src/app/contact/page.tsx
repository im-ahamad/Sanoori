import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ButtonLink } from "@/components/ui/button-link";
import { businessConfig } from "@/config/site";
import { getConfiguredContactChannels } from "@/lib/contact-channels";
import { isConfigPlaceholder } from "@/lib/config";
import { VisualBackdrop } from "@/components/shared/visual-backdrop";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Sanoori Trading for product availability, pricing, and support.",
  path: "/contact",
});

export default function ContactPage() {
  const configuredChannels = getConfiguredContactChannels();
  const channelsAvailable = configuredChannels.length > 0;
  const showAddress = !isConfigPlaceholder(businessConfig.address);

  return (
    <main className="flex-1">
      <PageHeader
        title="Contact"
        description="Message us on WhatsApp for prices and availability — or call us if that is easier for you."
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Contact us directly
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Message us on your preferred channel and we will reply with the
              price and delivery time.
            </p>

            <div className="mt-8">
              {channelsAvailable ? (
                <ContactChannels channels={configuredChannels} />
              ) : (
                <div className="rounded-lg border border-border bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
                  Contact details will be published here soon. In the meantime,
                  you can send us your request below.
                </div>
              )}
            </div>

            {!channelsAvailable && (
              <div className="mt-6">
                <ButtonLink href="/request-quote" variant="primary">
                  Get a Price
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            )}

            {showAddress && (
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block font-heading text-base font-semibold text-foreground">
                    Visit us
                  </span>
                  <span className="mt-1 block">
                    {businessConfig.address}
                    {!isConfigPlaceholder(businessConfig.city) &&
                      `, ${businessConfig.city}${!isConfigPlaceholder(businessConfig.country) ? `, ${businessConfig.country}` : ""}`}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-lg bg-navy-dark p-6 text-white sm:p-8">
              <VisualBackdrop variant="band" objectPosition="object-top" />
              <div className="relative">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                Getting prices for a project?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Send us the list of products and quantities you need and we
                will reply with prices for everything.
              </p>
              <ButtonLink
                href="/request-quote"
                variant="inverse"
                className="mt-6 w-full sm:w-auto"
              >
                Get a Price
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-card p-6">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Ask us anything
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Planning a new bathroom or unsure which material to use? Just
                message us and we are happy to help.
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageCircle className="size-4 text-primary" aria-hidden="true" />
                Response time: usually within one business day
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}