import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, BadgeCheck, ListChecks, Ruler } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { ButtonLink } from "@/components/ui/button-link";
import { AvailabilityBadge } from "@/components/products/availability-badge";
import {
  ProductGallery,
  type GalleryImage,
} from "@/components/products/product-gallery";
import { BuyPanel } from "@/components/products/buy-panel";
import { siteConfig } from "@/config/site";
import { getContactChannels } from "@/lib/contact-channels";
import { productImageHero } from "@/lib/cloudinary-url";
import {
  generatePageMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { getPublicProductBySlug } from "@/lib/public/catalogue";
import { getPublicBusinessSettings } from "@/lib/public/settings";
import { getServerTranslations } from "@/lib/i18n/server-translations";
import { cookies } from "next/headers";

async function getLang(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return {};

  return generatePageMetadata({
    title: product.name,
    description:
      product.shortDescription ?? product.description ?? siteConfig.description,
    path: `/products/${product.slug}`,
    image: product.primaryImage
      ? {
          url: productImageHero(product.primaryImage.url, 1200),
          alt: product.primaryImage.alt ?? product.name,
        }
      : undefined,
  });
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const lang = await getLang();
  const t = getServerTranslations(lang);
  const pd = t.productDetails;
  const products = t.products;

  const [product, businessSettings] = await Promise.all([
    getPublicProductBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const galleryImages: GalleryImage[] = product.images.map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt,
  }));

  const detailUrl = `/products/${product.slug}`;
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const productUrl = `${protocol}://${host}${detailUrl}`;

  const channels = getContactChannels(businessSettings);
  const phoneChannelEntry = channels.find(
    (channel) => channel.id === "phone" && channel.isConfigured
  );
  const phoneChannel = phoneChannelEntry
    ? { id: "phone" as const, label: phoneChannelEntry.label, href: phoneChannelEntry.href }
    : null;

  const heroSchema = JSON.stringify(
    generateProductSchema({
      name: product.name,
      description:
        product.description ?? product.shortDescription ?? siteConfig.description,
      slug: product.slug,
      images: product.images.map((image) => productImageHero(image.url, 1200)),
      productCode: product.productCode,
      availability: product.availability,
      category: product.categoryName,
    })
  );

  const breadcrumbSchema = JSON.stringify(
    generateBreadcrumbSchema([
      { name: products.breadcrumb, url: "/products" },
      { name: product.name, url: detailUrl },
    ])
  );

  const specificationsEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <main className="flex-1">
      <PageHeader
        title={product.name}
        description={product.shortDescription ?? undefined}
        breadcrumbs={[
          { label: products.breadcrumb, href: "/products" },
          { label: product.name, href: detailUrl },
        ]}
        objectFit="object-contain sm:object-cover"
      />

      <Container>
        <div className="section-spacing">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <ProductGallery images={galleryImages} productName={product.name} />

            {/* Buy rail */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <AvailabilityBadge availability={product.availability} />
                <Link
                  href={`/products?category=${product.categorySlug}`}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {product.categoryName}
                </Link>
                {product.subcategorySlug && (
                  <Link
                    href={`/products?category=${product.categorySlug}&subcategory=${product.subcategorySlug}`}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {product.subcategoryName}
                  </Link>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description || product.shortDescription}
                </p>
                {product.productCode && (
                  <p className="text-sm text-muted-foreground">
                    {pd.productCodeLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.productCode}
                    </span>
                  </p>
                )}
              </div>

              <BuyPanel
                productName={product.name}
                productId={product.id}
                productCode={product.productCode}
                productUrl={productUrl}
                productSlug={product.slug}
                phoneChannel={phoneChannel}
                businessSettings={businessSettings}
              />
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <section aria-labelledby="description-heading" className="mt-14">
              <SectionHeader
                title={pd.moreAboutTitle}
                description={pd.moreAboutDescription}
              />
              <div className="mt-5 max-w-3xl whitespace-pre-line rounded-lg border border-border bg-card p-6 text-base leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            </section>
          )}

          {/* Features */}
          {product.features.length > 0 && (
            <section aria-labelledby="features-heading" className="mt-14">
              <h2
                id="features-heading"
                className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
                {pd.keyFeaturesTitle}
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
                  >
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Specifications */}
          {specificationsEntries.length > 0 && (
            <section aria-labelledby="specs-heading" className="mt-14">
              <h2
                id="specs-heading"
                className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                <Ruler className="size-5 text-primary" aria-hidden="true" />
                {pd.specificationsTitle}
              </h2>
              <dl className="mt-5 max-w-3xl overflow-hidden rounded-lg border border-border">
                {specificationsEntries.map(([key, value], index) => (
                  <div
                    key={key}
                    className={
                      index % 2 === 0
                        ? "grid grid-cols-1 gap-1 bg-background p-4 sm:grid-cols-[1fr_2fr] sm:gap-4"
                        : "grid grid-cols-1 gap-1 bg-card p-4 sm:grid-cols-[1fr_2fr] sm:gap-4"
                    }
                  >
                    <dt className="text-sm font-semibold text-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <section aria-labelledby="variants-heading" className="mt-14">
              <h2
                id="variants-heading"
                className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                <ListChecks className="size-5 text-primary" aria-hidden="true" />
                {pd.variantsTitle}
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {product.variants.map((variant, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <dl className="space-y-1.5">
                      {Object.entries(variant).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-baseline justify-between gap-3 text-sm"
                        >
                          <dt className="text-muted-foreground">{key}</dt>
                          <dd className="text-right font-medium text-foreground">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Helpful actions */}
          <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-muted/40 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {pd.needDifferentTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pd.needDifferentDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href={`/request-quote?product=${product.slug}`}
              >
                {pd.getPriceButton}
              </ButtonLink>
              <ButtonLink href="/products" variant="outline">
                {pd.seeAllProductsButton}
              </ButtonLink>
            </div>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {pd.backToProducts}
          </Link>

          <div className="h-20 md:hidden" aria-hidden="true" />
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: heroSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
    </main>
  );
}