import { Check, Clock, FileText, LineChart } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import { getPublicProductOptions } from "@/lib/public/catalogue";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Request a Quote",
  description:
    "Send your requirements to Sanoori Trading and receive pricing and availability for sanitary ware, tiles, and building materials.",
  path: "/request-quote",
});

const helpfulDetails = [
  {
    icon: FileText,
    title: "Products or categories",
    description:
      "Which items you are interested in — for example, wall tiles, commodes, or a full bathroom set.",
  },
  {
    icon: LineChart,
    title: "Quantity",
    description:
      "Approximate quantities help us quote accurate pricing and check current availability.",
  },
  {
    icon: Check,
    title: "Specifications",
    description:
      "Sizes, finishes, colours, or brand preferences you care about. Send what you know and we will fill the gaps.",
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
        title="Request a Quote"
        description="Tell us what you need and we will get back to you with pricing and availability."
        breadcrumbs={[{ label: "Request a Quote", href: "/request-quote" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Helpful to include
            </h2>
            <ul className="mt-8 space-y-6">
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
              No exact specification yet? Send what you know and we will help
              you identify suitable options.
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
                  <span>
                    We review your request and confirm the products are
                    available.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    2
                  </span>
                  <span>
                    We follow up via phone or email with pricing and lead time.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    3
                  </span>
                  <span>There is no obligation — explore options freely.</span>
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
                Fill in the form below and our team will get back to you with
                pricing and availability.
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