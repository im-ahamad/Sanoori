import Link from "next/link";
import { Users, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminCustomers } from "@/lib/admin/customers";
import { CustomerFilters } from "@/components/admin/customer-filters";
import { CustomerTable } from "@/components/admin/customer-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Customers",
};

async function getLanguage(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

function stringParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminCustomersPage(
  props: PageProps<"/admin/customers">
) {
  const [lang, searchParams] = await Promise.all([
    getLanguage(),
    props.searchParams,
  ]);
  const t = getServerAdminTranslations(lang);

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
          {t.common.customers}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.customersDerived}
        </p>
      </div>

      <CustomerFilters values={{ q, sort }} />

      {!listResult.ok ? (
        <SectionError
          title={t.common.couldNotLoadCustomers}
          description={t.common.pleaseTryAgain}
        />
      ) : listResult.data.items.length === 0 ? (
        hasFilters ? (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title={t.common.noMatchingCustomers}
              description={t.common.noCustomersMatchFilters}
              icon={<SearchX className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin/customers" />}
              >
                {t.common.clearSearchFilters}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title={t.common.noCustomersYet}
              description={t.common.addCustomerDesc}
              icon={<Users className="size-8 text-muted-foreground" />}
            />
          </div>
        )
      ) : (
        <div>
          <p className="sr-only" role="status">
            {t.common.showing} {listResult.data.total.toLocaleString()} {t.common.customers}
          </p>
          <CustomerTable data={listResult.data} query={queryString} />
        </div>
      )}
    </div>
  );
}