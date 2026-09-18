import { Phone, Mail, MessageCircle, Check } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Request a Quote",
  description:
    "Send your requirements to Sanoori Trading and receive pricing and availability for sanitary ware, tiles, and building materials.",
  path: "/request-quote",
});

const suggestionItems = [
  {
    title: "Products or categories",
    description:
      "Which items you are interested in — for example, wall tiles, commodes, or a full bathroom set.",
  },
  {
    title: "Quantity",
    description:
      "Approximate quantities help us quote accurate pricing and check availability.",
  },
  {
    title: "Delivery location",
    description:
      "Where the products should be delivered, so we can confirm delivery options.",
  },
];

export default function RequestQuotePage() {
  const showPhone = !isConfigPlaceholder(businessConfig.phone);
  const showWhatsapp = !isConfigPlaceholder(businessConfig.whatsapp);
  const showEmail = !isConfigPlaceholder(businessConfig.email);

  return (
    <main className="flex-1">
      <PageHeader
        title="Request a Quote"
        description="Tell us what you need and we will get back to you with pricing and availability."
        breadcrumbs={[{ label: "Request a Quote", href: "/request-quote" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What to include in your request
            </h2>
            <ul className="mt-8 space-y-6">
              {suggestionItems.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <Check className="size-4" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
              No exact specification yet? Send what you know and we will help
              you identify suitable options.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg bg-navy-dark p-6 text-white sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                Send your request
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                A quote request form is coming soon. Until then, please send
                your requirements by the channel below.
              </p>
              <ul className="mt-6 space-y-3">
                {showWhatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${businessConfig.whatsapp.replace(
                        /[^0-9]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
                    >
                      <MessageCircle className="size-4" />
                      WhatsApp
                    </a>
                  </li>
                )}
                {showPhone && (
                  <li>
                    <a
                      href={`tel:${businessConfig.phone}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
                    >
                      <Phone className="size-4" />
                      {businessConfig.phone}
                    </a>
                  </li>
                )}
                {showEmail && (
                  <li>
                    <a
                      href={`mailto:${businessConfig.email}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
                    >
                      <Mail className="size-4" />
                      {businessConfig.email}
                    </a>
                  </li>
                )}
                {!showWhatsapp && !showPhone && !showEmail && (
                  <li className="text-sm leading-relaxed text-white/75">
                    Our contact channels are being finalised. Please check back
                    shortly, or visit the contact page for updates.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}