import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, BadgeCheck, Ruler, Globe } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { ButtonLink } from "@/components/ui/button-link";
import { AvailabilityBadge } from "@/components/products/availability-badge";
import {
  ProductGallery,
  type GalleryImage,
} from "@/components/products/product-gallery";
import { ProductCard } from "@/components/products/product-card";
import { BuyPanel } from "@/components/products/buy-panel";
import { siteConfig } from "@/config/site";
import { getContactChannels } from "@/lib/contact-channels";
import { productImageHero } from "@/lib/cloudinary-url";
import {
  generatePageMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { getPublicProductBySlug, getRelatedProducts } from "@/lib/public/catalogue";
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
      product.description ?? siteConfig.description,
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

  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [businessSettings, relatedProducts] = await Promise.all([
    getPublicBusinessSettings(),
    getRelatedProducts(product.categorySlug, product.subcategorySlug, product.id, 4),
  ]);

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
        product.description ?? siteConfig.description,
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

  return (
    <main className="flex-1">
      <PageHeader
        title={product.name}
        description={undefined}
        breadcrumbs={[
          { label: products.breadcrumb, href: "/products" },
          { label: product.name, href: detailUrl },
        ]}
        backgroundImage="/images/about-hero.png"
        objectFit="object-contain sm:object-cover"
        backdropOverlay="bg-gradient-to-b from-navy-dark/48 via-navy-dark/40 to-navy-dark/33"
      />

      <Container>
        <div className="section-spacing">
          {/* ============================================================
                TOP PRODUCT AREA — 2-column: Image (left) | Info (right)
                Single unified bordered container
           ============================================================ */}
          <div className="flex flex-col lg:flex-row rounded-2xl border border-border overflow-hidden bg-card">
            {/* Product Image — LEFT */}
            <div className="flex-1 min-w-0 lg:rounded-l-2xl">
              <ProductGallery images={galleryImages} productName={product.name} hideThumbnails />
            </div>

            {/* Right-side — Information SECTION */}
            <div className="flex-1 min-w-0 bg-gradient-to-b from-rose-50 to-white dark:from-muted dark:to-card p-5 lg:p-6 space-y-4 overflow-hidden h-[560px] lg:h-[580px] flex flex-col">
              {/* Category badges */}
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

              {/* Basic Product Information */}
              <div className="space-y-2.5 pb-2">
                <p className="text-sm text-muted-foreground">
                  {pd.productNameLabel}:{" "}
                  <span className="font-semibold text-foreground">
                    {product.name}
                  </span>
                </p>
                {product.productCode && (
                  <p className="text-sm text-muted-foreground">
                    {pd.productCodeLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.productCode}
                    </span>
                  </p>
                )}
                {product.material && (
                  <p className="text-sm text-muted-foreground">
                    {pd.materialLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.material}
                    </span>
                  </p>
                )}
                {product.size && (
                  <p className="text-sm text-muted-foreground">
                    {pd.sizeLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.size}
                    </span>
                  </p>
                )}
                {product.colorFinish && (
                  <p className="text-sm text-muted-foreground">
                    {pd.colorFinishLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.colorFinish}
                    </span>
                  </p>
                )}
                {product.madeIn && (
                  <p className="text-sm text-muted-foreground">
                    {pd.madeInLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {product.madeIn}
                    </span>
                  </p>
                )}
              </div>

              {/* "More about this product" heading */}
              <div className="space-y-1 pt-2">
                <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                  {pd.moreAboutTitle}
                </h2>
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                  {pd.moreAboutDescription}
                </p>
              </div>

              {/* Description, Key Features, Specifications — unified flow */}
              <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
                {/* Description */}
                {product.description && (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-1">
                    <h3 className="font-heading text-lg font-bold text-foreground flex-shrink-0">
                      Description
                    </h3>
                    <div className="product-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden whitespace-pre-line break-words text-base leading-relaxed text-muted-foreground">
                      {product.description}
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {product.features.length > 0 && (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-1">
                    <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground flex-shrink-0">
                      <BadgeCheck className="size-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      {pd.keyFeaturesTitle}
                    </h3>
                    <div className="product-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden whitespace-pre-line break-words text-base leading-relaxed text-muted-foreground">
                      {product.features.map((feature, index) => (index > 0 ? "\n" : "") + feature).join("")}
                    </div>
                  </div>
                )}

                {/* Specifications */}
                <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-1">
                  <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground flex-shrink-0">
                    <Ruler className="size-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                    {pd.specificationsTitle}
                  </h3>
                  <div className="product-scroll flex-1 min-h-0 overflow-y-auto overflow-x-auto whitespace-pre-line break-words text-base leading-relaxed text-muted-foreground">
                    {product.specifications.length > 0 ? (
                      product.specifications.map((spec, index) => (index > 0 ? "\n" : "") + spec).join("")
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specifications available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
               GET A PRICE SECTION — Moved below top area, full width
               (Existing BuyPanel component, NOT redesigned)
          ============================================================ */}
          <div className="mt-10 lg:mt-12">
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

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section aria-labelledby="related-products-heading" className="mt-14">
              <SectionHeader
                title={pd.relatedProductsTitle}
                description={pd.relatedProductsDescription}
              />
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    variant="grid"
                    hideAvailabilityBadge
                  />
                ))}
              </div>
            </section>
          )}

          {/* Helpful actions — Back to products + Get Price link */}
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