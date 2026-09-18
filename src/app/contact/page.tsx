import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Sanoori Trading for product availability, pricing, and support.",
  path: "/contact",
});

const contactMethods = [
  {
    key: "phone",
    label: "Phone",
    icon: Phone,
    href: businessConfig.phone ? `tel:${businessConfig.phone}` : null,
    value: businessConfig.phone,
    external: false,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    href: businessConfig.whatsapp
      ? `https://wa.me/${businessConfig.whatsapp.replace(/[^0-9]/g, "")}`
      : null,
    value: businessConfig.whatsapp,
    external: true,
  },
  {
    key: "email",
    label: "Email",
    icon: Mail,
    href: businessConfig.email ? `mailto:${businessConfig.email}` : null,
    value: businessConfig.email,
    external: false,
  },
] as const;

export default function ContactPage() {
  const hasContactInfo = !isConfigPlaceholder(businessConfig.phone);
  const showAddress = !isConfigPlaceholder(businessConfig.address);

  return (
    <main className="flex-1">
      <PageHeader
        title="Contact"
        description="Get in touch for product availability, pricing, and support."
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Reach us directly
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              You can reach us by any of the channels below. For pricing and
              availability, the quickest way is to submit a quote request.
            </p>

            {hasContactInfo ? (
              <ul className="mt-8 space-y-4">
                {contactMethods.map((method) =>
                  method.href ? (
                    <li key={method.key}>
                      <a
                        href={method.href}
                        {...(method.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                          <method.icon className="size-5" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {method.label}
                          </span>
                          <span className="mt-0.5 block font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                            {method.value}
                          </span>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            ) : (
              <div className="mt-8 rounded-lg border border-border bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
                Contact details are being finalised and will be published here
                shortly. In the meantime, you can send a quote request below.
              </div>
            )}

            {showAddress && (
              <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {businessConfig.address}
                  {!isConfigPlaceholder(businessConfig.city) &&
                    `, ${businessConfig.city}, ${businessConfig.country}`}
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg bg-navy-dark p-6 text-white sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                Prefer a formal quote?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Tell us which products and quantities you need. We will respond
                with pricing and current availability.
              </p>
              <ButtonLink
                href="/request-quote"
                variant="inverse"
                className="w-full sm:w-auto"
              >
                Request a Quote
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}