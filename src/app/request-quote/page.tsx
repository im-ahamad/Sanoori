import { ArrowRight, Check, Clock, MessageCircle, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProductRequestForm } from "@/components/products/product-request-form";
import { buildWhatsAppLink, GENERAL_ENQUIRY_MESSAGE } from "@/lib/contact/whatsapp";
import {
  getPublicProductBySlug,
  getPublicProductOptions,
  heroImageUrl,
} from "@/lib/public/catalogue";
import { generatePageMetadata } from "@/lib/seo";
import { notFound, redirect } from "next/navigation";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";
import { getPublicBusinessSettings } from "@/lib/public/settings";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata(): Promise<ReturnType<typeof generatePageMetadata>> {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const rq = t.requestQuote as typeof t.requestQuote & {
    pageTitle: string;
    pageDescription: string;
  };
  return generatePageMetadata({
    title: rq.pageTitle,
    description: rq.pageDescription,
    path: "/request-quote",
  });
}

export default async function RequestQuotePage({
  searchParams,
}: PageProps<"/request-quote">) {
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const rq = t.requestQuote as typeof t.requestQuote & {
    pageTitle: string;
    pageDescription: string;
    breadcrumb: string;
    productInfoLabel: string;
    viewProductDetails: string;
    whatsappCTA: { title: string; description: string };
    helpfulToInclude: {
      title: string;
      quantity: { title: string; description: string };
      sizesOrColours: { title: string; description: string };
    };
    whatHappensNext: {
      title: string;
      steps: string[];
      responseTime: string;
    };
    sendRequest: { title: string; description: string };
    productSummary: { requestingPriceFor: string; modelLabel: string };
  };

  const { product, quantity } = await searchParams;
  const requestedSlug = typeof product === "string" ? product.trim() : "";
  const initialQuantity = typeof quantity === "string" ? parseInt(quantity, 10) : undefined;

  if (!requestedSlug) {
    redirect("/products");
  }

  const [productOptions, businessSettings] = await Promise.all([
    getPublicProductOptions(),
    getPublicBusinessSettings(),
  ]);

  const whatsappHref = buildWhatsAppLink(businessSettings, GENERAL_ENQUIRY_MESSAGE);

  const productDetail = productOptions.some((option) => option.slug === requestedSlug)
    ? await getPublicProductBySlug(requestedSlug)
    : null;

  if (!productDetail) {
    notFound();
  }

  return (
    <main className="flex-1">
      <PageHeader
        title={rq.pageTitle}
        description={rq.pageDescription}
        breadcrumbs={[{ label: rq.breadcrumb, href: "/request-quote" }]}
      />

      <Container>
        <div className="section-spacing grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center">
              {productDetail.primaryImage ? (
                <Image
                  src={heroImageUrl(productDetail.primaryImage.url)}
                  alt={productDetail.primaryImage.alt ?? productDetail.name}
                  width={320}
                  height={240}
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="h-48 w-full flex-shrink-0 rounded-lg bg-muted object-cover md:h-40 md:w-72"
                />
              ) : (
                <span className="flex h-48 w-full flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground md:h-40 md:w-72">
                  <Package className="size-10" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-text">
                  {rq.productInfoLabel}
                </p>
                <h1
                  id="request-quote-product-title"
                  className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                >
                  {productDetail.name}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {productDetail.categoryName}
                  {productDetail.productCode
                    ? ` · ${rq.productSummary.modelLabel} ${productDetail.productCode}`
                    : ""}
                </p>
                <Link
                  href={`/products/${productDetail.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {rq.viewProductDetails}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

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
                    {rq.whatsappCTA.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-white/90">
                    {rq.whatsappCTA.description}
                  </span>
                </span>
              </a>
            )}

            <h2 className="mt-10 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {rq.helpfulToInclude.title}
            </h2>
            <ul className="mt-6 space-y-6">
              {[
                {
                  icon: Package,
                  title: rq.helpfulToInclude.quantity.title,
                  description: rq.helpfulToInclude.quantity.description,
                },
                {
                  icon: Check,
                  title: rq.helpfulToInclude.sizesOrColours.title,
                  description: rq.helpfulToInclude.sizesOrColours.description,
                },
              ].map((item) => (
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

            <div className="mt-10 rounded-lg border border-border bg-card p-6">
              <h2 className="font-heading text-base font-semibold text-foreground">
                {rq.whatHappensNext.title}
              </h2>
              <ul className="mt-4 space-y-4">
                {rq.whatHappensNext.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                {rq.whatHappensNext.responseTime}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                {rq.sendRequest.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {rq.sendRequest.description}
              </p>
              <div className="mt-6">
                <ProductRequestForm
                  product={{
                    slug: productDetail.slug,
                    name: productDetail.name,
                    model: productDetail.productCode,
                    categoryName: productDetail.categoryName,
                    image: productDetail.primaryImage
                      ? {
                          url: heroImageUrl(productDetail.primaryImage.url),
                          alt: productDetail.primaryImage.alt,
                        }
                      : null,
                  }}
                  whatsappHref={whatsappHref}
                  initialLang={lang}
                  initialQuantity={initialQuantity}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}