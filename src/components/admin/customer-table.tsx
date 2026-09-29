"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { CustomerList } from "@/lib/admin/customers";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface PaginationProps {
  data: CustomerList;
  query: string;
}

function CustomerPagination({
  data,
  query,
  t,
}: PaginationProps & { t: ReturnType<typeof useAdminTranslations> }) {
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
    return search ? `/admin/customers?${search}` : "/admin/customers";
  };

  return (
    <nav
      aria-label={t.common.productPagination}
      className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground">
        {t.common.showing} {start}–{end} {t.common.of} {total.toLocaleString()} {t.common.customers}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {t.common.page} {page} {t.common.of} {totalPages}
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
            <span className="sr-only">{t.common.previousPage}</span>
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
            <span className="sr-only">{t.common.nextPage}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface CustomerTableProps {
  data: CustomerList;
  query: string;
}

export function CustomerTable({ data, query }: CustomerTableProps) {
  const t = useAdminTranslations();

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
                    {t.common.customer}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    {t.common.customerPhone}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    {t.common.email}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">
                    {t.common.orders}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    {t.common.lastOrder}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((customer) => (
                  <tr
                    key={customer.phone}
                    className="align-middle transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      {customer.phone}
                    </td>
                    <td className="hidden max-w-56 px-4 py-3 lg:table-cell">
                      <span className="line-clamp-1 text-muted-foreground">
                        {customer.email ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {customer.totalOrders}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {formatDate(customer.lastOrderAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                          {t.common.view}
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
            {data.items.map((customer) => (
              <li key={customer.phone} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {customer.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {customer.phone}
                    </p>
                    {customer.email && (
                      <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-foreground">{customer.totalOrders}</span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t.common.lastOrder}: {formatDate(customer.lastOrderAt)}
                </p>

                <div className="mt-3 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                      />
                    }
                  >
                    <Eye className="size-3.5" aria-hidden="true" />
                    {t.common.viewCustomer}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <CustomerPagination data={data} query={query} t={t} />
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