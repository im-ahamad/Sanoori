import { Check, Clock, FileText, LineChart, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { getPublicProductOptions } from "@/lib/public/catalogue";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Get a Price",
  description:
    "Ask Sanoori Trading for the price of sanitary ware, tiles, and building materials. Message us on WhatsApp or send a short request — we reply quickly.",
  path: "/request-quote",
});

const helpfulDetails = [
  {
    icon: FileText,
    title: "Which products you need",
    description:
      "For example: wall tiles, a commode, or a full bathroom set.",
  },
  {
    icon: LineChart,
    title: "Quantity",
    description:
      "An approximate quantity helps us give you an accurate price.",
  },
  {
    icon: Check,
    title: "Sizes or colours",
    description:
      "Sizes, finishes, or colours you want. Send what you know and we will fill the gaps.",
  },
];

export default async function RequestQuotePage({
  searchParams,
}: PageProps<"/request-quote">) {
  const { product } = await searchParams;
  const requestedSlug = typeof product === "string" ? product.trim() : "";

  const [productOptions, whatsappHref] = await Promise.all([
    getPublicProductOptions(),
    buildWhatsAppLink(GENERAL_ENQUIRY_MESSAGE),
  ]);

  const initialProductSlug =
    requestedSlug &&
    productOptions.some((option) => option.slug === requestedSlug)
      ? requestedSlug
      : "";

  return (
    <main className="flex-1">
      <PageHeader
        title="Get a Price"
        description="Fastest? Message us on WhatsApp. Otherwise, send a short request below."
        breadcrumbs={[{ label: "Get a Price", href: "/request-quote" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-lg bg-[#25D366] p-5 text-white shadow-sm transition-colors hover:bg-[#1fb958] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-base font-semibold">
                    Message us on WhatsApp
                  </span>
                  <span className="mt-0.5 block text-sm text-white/90">
                    Tell us what you need and get a reply fast.
                  </span>
                </span>
              </a>
            )}

            <h2 className="mt-10 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Helpful to include
            </h2>
            <ul className="mt-6 space-y-6">
              {helpfulDetails.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <item.icon className="size-4" strokeWidth={2} aria-hidden="true" />
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
              Not sure which product you need? Send what you know and we will
              help you choose.
            </p>

            <div className="mt-10 rounded-lg border border-border bg-card p-6">
              <h2 className="font-heading text-base font-semibold text-foreground">
                What happens next
              </h2>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    1
                  </span>
                  <span>We check the price and availability for you.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    2
                  </span>
                  <span>We reply on WhatsApp, phone, or email.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    3
                  </span>
                  <span>No obligation — just an easy way to ask.</span>
                </li>
              </ul>
              <p className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                We typically respond within one business day
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                Send your request
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Fill in the short form and we will send you the prices.
              </p>
              <div className="mt-6">
                <InquiryForm
                  productOptions={productOptions}
                  initialProductSlug={initialProductSlug}
                  whatsappHref={whatsappHref}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}