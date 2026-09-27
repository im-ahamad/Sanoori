import Link from "next/link";
import { Users, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminCustomers } from "@/lib/admin/customers";
import { CustomerFilters } from "@/components/admin/customer-filters";
import { CustomerTable } from "@/components/admin/customer-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = {
  title: "Customers",
};

function stringParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminCustomersPage(
  props: PageProps<"/admin/customers">
) {
  const searchParams = await props.searchParams;

  const q = stringParam(searchParams.q) ?? "";
  const sort = stringParam(searchParams.sort) ?? "newest";

  const pageNumber = Number(searchParams.page);
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (sort !== "newest") query.set("sort", sort);
  const queryString = query.toString();

  const listResult = await listAdminCustomers({
    q,
    sort,
    page,
  });

  const hasFilters = q !== "" || sort !== "newest";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View customers derived from order history. No customer accounts required.
        </p>
      </div>

      <CustomerFilters values={{ q, sort }} />

      {!listResult.ok ? (
        <SectionError
          title="Could not load customers"
          description="We could not load customers. Please try again in a moment."
        />
      ) : listResult.data.items.length === 0 ? (
        hasFilters ? (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No matching customers"
              description="No customers match your current search or filters. Try different terms or clear the filters."
              icon={<SearchX className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin/customers" />}
              >
                Clear search and filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No customers yet"
              description="Customers appear here when they submit their first order."
              icon={<Users className="size-8 text-muted-foreground" />}
            />
          </div>
        )
      ) : (
        <div>
          <p className="sr-only" role="status">
            Showing {listResult.data.total.toLocaleString()} customers
          </p>
          <CustomerTable data={listResult.data} query={queryString} />
        </div>
      )}
    </div>
  );
}