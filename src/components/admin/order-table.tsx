import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { OrderList } from "@/lib/admin/orders";
import { inquirySourceLabel } from "@/lib/inquiries";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";
import { InquiryContactActions } from "@/components/admin/inquiry-contact-actions";

function buildWhatsAppMessage(
  customerName: string,
  productName: string | null
): string {
  const productPart = productName ? ` for ${productName}` : "";
  return `Hello ${customerName}, this is Sanoori Trading regarding your inquiry${productPart}. Could we discuss your requirements?`;
}

interface PaginationProps {
  data: OrderList;
  query: string;
}

function OrderPagination({ data, query }: PaginationProps) {
  const { page, totalPages, total, pageSize } = data;
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(query);
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const search = params.toString();
    return search ? `/admin/orders?${search}` : "/admin/orders";
  };

  return (
    <nav
      aria-label="Order pagination"
      className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {total.toLocaleString()} orders
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-1.5">
          <Link
            href={buildHref(page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              page <= 1 && "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="sr-only">Previous page</span>
          </Link>
          <Link
            href={buildHref(page + 1)}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              page >= totalPages && "pointer-events-none opacity-50"
            )}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="sr-only">Next page</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface OrderTableProps {
  data: OrderList;
  query: string;
}

export function OrderTable({ data, query }: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {data.items.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Customer
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    Phone
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    Product
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    Model
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    Qty
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    Source
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((order) => (
                  <tr
                    key={order.id}
                    className="align-middle transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {order.customerName}
                      </Link>
                      {order.email ? (
                        <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      ) : null}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      {order.phone}
                    </td>
                    <td className="hidden max-w-56 px-4 py-3 lg:table-cell">
                      <span className="line-clamp-1 text-muted-foreground">
                        {order.productName ?? "—"}
                      </span>
                    </td>
                    <td className="hidden max-w-40 px-4 py-3 text-muted-foreground xl:table-cell">
                      <span className="line-clamp-1">
                        {order.productCode ?? "—"}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground xl:table-cell">
                      {order.quantity?.toLocaleString() ?? "—"}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      {inquirySourceLabel(order.source)}
                    </td>
                    <td className="px-4 py-3">
                      <InquiryStatusBadge status={order.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <InquiryContactActions
                          phone={order.phone}
                          email={order.email}
                          whatsappMessage={buildWhatsAppMessage(
                            order.customerName,
                            order.productName
                          )}
                          compact
                        />
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <ul className="divide-y divide-border lg:hidden">
            {data.items.map((order) => (
              <li key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {order.customerName}
                    </Link>
                    {order.email ? (
                      <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {order.phone}
                    </p>
                  </div>
                  <InquiryStatusBadge status={order.status} />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {order.productName
                    ? `Product: ${order.productName}`
                    : "No product selected"}
                  {order.productCode ? ` · Model: ${order.productCode}` : ""}
                  {order.quantity ? ` · Qty ${order.quantity.toLocaleString()}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {inquirySourceLabel(order.source)} ·{" "}
                  {formatDate(order.createdAt)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <InquiryContactActions
                    phone={order.phone}
                    email={order.email}
                    whatsappMessage={buildWhatsAppMessage(
                      order.customerName,
                      order.productName
                    )}
                    compact
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link href={`/admin/orders/${order.id}`} />
                    }
                  >
                    <Eye className="size-3.5" aria-hidden="true" />
                    View order
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <OrderPagination data={data} query={query} />
        </>
      ) : null}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}