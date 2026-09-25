import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { getAdminCustomerDetail } from "@/lib/admin/customers";
import { formatInquiryDate, inquiryStatusLabel } from "@/lib/inquiries";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";
import { SectionError } from "@/components/admin/section-error";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Customer",
};

export default async function AdminCustomerDetailPage(
  props: PageProps<"/admin/customers/[id]">
) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const phone = decodeURIComponent(params.id);

  const detailResult = await getAdminCustomerDetail(phone);

  if (!detailResult.ok) {
    if (detailResult.error === "not-found") notFound();
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Link
          href="/admin/customers"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to customers
        </Link>
        <SectionError
          title="Could not load this customer"
          description="We could not load this customer. Please try again."
        />
      </div>
    );
  }

  const customer = detailResult.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/admin/customers"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to customers
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {customer.name}
          </h1>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
            {customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Last order {formatInquiryDate(customer.lastOrderAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ===== Main column ===== */}
        <div className="space-y-6 lg:col-span-3">
          <section
            aria-labelledby="customer-info-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="customer-info-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Customer information
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {customer.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  WhatsApp / IMO Number
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  <a
                    href={`tel:${customer.phone}`}
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {customer.phone}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Orders
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {customer.totalOrders}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  First Order
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {formatInquiryDate(
                    customer.orders[customer.orders.length - 1]?.createdAt ??
                      customer.lastOrderAt
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Order
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {formatInquiryDate(customer.lastOrderAt)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* ===== Side column - Order History ===== */}
        <div className="space-y-6 lg:col-span-2">
          <section
            aria-labelledby="customer-orders-heading"
            className="rounded-lg border border-border bg-background p-4 sm:p-6"
          >
            <h2
              id="customer-orders-heading"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Order history
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing all {customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}.
            </p>

            <div className="mt-4 space-y-3">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-md border border-border bg-background/50 p-3 transition-colors hover:bg-background"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {order.productName ?? "No product selected"}
                      </p>
                      {order.productCode && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          #{order.productCode}
                        </p>
                      )}
                    </div>
                    <InquiryStatusBadge status={order.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {order.quantity ? `Qty: ${order.quantity.toLocaleString()}` : "Qty: —"}
                    </span>
                    <span>{formatInquiryDate(order.createdAt)}</span>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    <MessageSquare className="size-3" aria-hidden="true" />
                    View order
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}