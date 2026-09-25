import Link from "next/link";
import { Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminOrders } from "@/lib/admin/orders";
import { isInquiryStatus, isInquirySource } from "@/lib/inquiries";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrderTable } from "@/components/admin/order-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashBanner } from "@/components/admin/flash-banner";

export const metadata = {
  title: "Orders",
};

function stringParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminOrdersPage(
  props: PageProps<"/admin/orders">
) {
  const searchParams = await props.searchParams;

  const q = stringParam(searchParams.q) ?? "";
  const status = stringParam(searchParams.status) ?? "";
  const source = stringParam(searchParams.source) ?? "";
  const sort = stringParam(searchParams.sort) ?? "newest";

  const pageNumber = Number(searchParams.page);
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (status) query.set("status", status);
  if (source) query.set("source", source);
  if (sort !== "newest") query.set("sort", sort);
  const queryString = query.toString();

  const listResult = await listAdminOrders({
    q,
    status: isInquiryStatus(status) ? status : undefined,
    source: isInquirySource(source) ? source : undefined,
    sort,
    page,
  });

  const hasFilters = q !== "" || status !== "" || source !== "" || sort !== "newest";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review customer quote requests, view details, and update their status.
        </p>
      </div>

      {searchParams.updated === "1" ? <FlashBanner kind="inquiryUpdated" /> : null}

      <OrderFilters
        values={{
          q,
          status: isInquiryStatus(status) ? status : "",
          source: isInquirySource(source) ? source : "",
          sort,
        }}
      />

      {!listResult.ok ? (
        <SectionError
          title="Could not load orders"
          description="We could not load your orders. Please try again in a moment."
        />
      ) : listResult.data.items.length === 0 ? (
        hasFilters ? (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No matching orders"
              description="No orders match your current search or filters. Try different terms or clear the filters."
              icon={<SearchX className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin/orders" />}
              >
                Clear search and filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No orders yet"
              description="When customers submit a quote request on the website, it will show up here."
              icon={<Inbox className="size-8 text-muted-foreground" />}
            />
          </div>
        )
      ) : (
        <div>
          <p className="sr-only" role="status">
            Showing {listResult.data.total.toLocaleString()} orders
          </p>
          <OrderTable data={listResult.data} query={queryString} />
        </div>
      )}
    </div>
  );
}