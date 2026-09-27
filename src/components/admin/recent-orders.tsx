"use client";

import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import type { RecentOrder } from "@/lib/admin/dashboard";
import { EmptyState } from "@/components/shared/empty-state";
import { InquiryStatusBadge } from "@/components/admin/inquiry-status-badge";
import { formatInquiryDate } from "@/lib/inquiries";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

function formatDate(date: Date): string {
  return formatInquiryDate(date);
}

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  const t = useAdminTranslations();

  if (orders.length === 0) {
    return (
      <section aria-labelledby="recent-orders-heading">
        <h2
          id="recent-orders-heading"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          {t.common.recentOrders}
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-background">
          <EmptyState
            title={t.common.noOrdersYet}
            description={t.common.ordersAppearHere}
            icon={<Inbox className="size-8 text-muted-foreground" />}
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recent-orders-heading">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-orders-heading"
          className="font-heading text-base font-bold tracking-tight text-foreground"
        >
          {t.common.recentOrders}
        </h2>
        <Link
          href="/admin/orders"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {t.common.viewAll}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                {t.common.customer}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                {t.common.product}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                {t.common.qty}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                {t.common.status}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                {t.common.date}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {order.customerName}
                  </Link>
                  <p className="text-xs text-muted-foreground lg:hidden">
                    {formatDate(order.createdAt)}
                  </p>
                </td>
                <td className="hidden max-w-56 px-4 py-3 text-muted-foreground md:table-cell">
                  <span className="line-clamp-1">
                    {order.productName ?? "—"}
                  </span>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                  {order.quantity?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <InquiryStatusBadge status={order.status} />
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}