import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  PackageSearch,
} from "lucide-react";
import { getAdminOrderDetail } from "@/lib/admin/order-detail";
import {
  formatInquiryDate,
  inquirySourceLabel,
  inquiryStatusDescriptions,
  inquiryStatusLabel,
} from "@/lib/inquiries";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";
import { InquiryContactActions } from "@/components/admin/inquiry-contact-actions";
import { InquiryStatusForm } from "@/components/admin/inquiry-status-form";
import { FlashBanner } from "@/components/admin/flash-banner";
import { SectionError } from "@/components/admin/section-error";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Order",
};

async function getLanguage(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

function buildWhatsAppMessage(
  customerName: string,
  productName: string | null
): string {
  const productPart = productName ? ` for ${productName}` : "";
  return `Hello ${customerName}, this is Sanoori Trading regarding your inquiry${productPart}. Could we discuss your requirements?`;
}

export default async function AdminOrderDetailPage(
  props: PageProps<"/admin/orders/[id]">
) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const justUpdated = searchParams.updated === "1";

  const detailResult = await getAdminOrderDetail(params.id);

  if (!detailResult.ok) {
    if (detailResult.error === "not-found") notFound();
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Link
          href="/admin/orders"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to orders
        </Link>
        <SectionError
          title="Could not load this order"
          description="We could not load this order. It may have been deleted, or something went wrong. Please try again."
        />
      </div>
    );
  }

  const inquiry = detailResult.data;
  const product = inquiry.product;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        {justUpdated ? <FlashBanner kind="inquiryUpdated" /> : null}
        <Link
          href="/admin/orders"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {inquiry.customerName}
          </h1>
          <InquiryStatusBadge status={inquiry.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Order received {formatInquiryDate(inquiry.createdAt)} ·{" "}
          {inquirySourceLabel(inquiry.source)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ===== Main column ===== */}
        <div className="space-y-6 lg:col-span-3">
          <section
            aria-labelledby="order-details-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="order-details-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Order details
            </h2>

            <div className="mt-4 rounded-md bg-muted/60 px-4 py-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {inquiry.message}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Product
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {product ? product.name : "No product selected"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Model / Code
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {product?.productCode ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quantity
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {inquiry.quantity?.toLocaleString() ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Source
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {inquirySourceLabel(inquiry.source)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {inquiryStatusLabel(inquiry.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Received
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {formatInquiryDate(inquiry.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last updated
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {formatInquiryDate(inquiry.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="order-customer-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="order-customer-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Customer
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {inquiry.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  WhatsApp / IMO Number
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {inquiry.phone}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {inquiry.email ? (
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {inquiry.email}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* ===== Side column ===== */}
        <div className="space-y-6 lg:col-span-2">
          <section
            aria-labelledby="order-product-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="order-product-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Product
            </h2>

            {product ? (
              <div className="mt-4 flex gap-4">
                {product.imageUrl ? (
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt ?? `Image of ${product.name}`}
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <PackageSearch
                      className="size-7 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {product.name}
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </Link>
                  {product.productCode ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      #{product.productCode}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    {product.categoryName ?? "Uncategorized"}
                    {!product.isActive ? " · Inactive" : ""}
                  </p>
                </div>
              </div>
            ) : inquiry.productId ? (
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                This product is no longer available. It may have been removed
                from the catalogue.
              </p>
            ) : (
              <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                The customer did not select a product for this order.
              </p>
            )}
          </section>

          <section
            aria-labelledby="order-contact-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="order-contact-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Contact
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Reach the customer directly from their order details.
            </p>
            <div className="mt-4">
              <InquiryContactActions
                phone={inquiry.phone}
                email={inquiry.email}
                whatsappMessage={buildWhatsAppMessage(
                  inquiry.customerName,
                  product?.name ?? null
                )}
              />
            </div>
          </section>

          <section
            aria-labelledby="order-status-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="order-status-heading"
                className="font-heading text-base font-bold tracking-tight text-foreground"
              >
                Update status
              </h2>
              <CalendarClock className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {inquiryStatusDescriptions[inquiry.status]}
            </p>
            <div className="mt-4">
              <InquiryStatusForm
                inquiryId={inquiry.id}
                currentStatus={inquiry.status}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}