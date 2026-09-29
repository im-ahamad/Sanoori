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
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Orders",
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

  const [lang, listResult] = await Promise.all([
    getLanguage(),
    listAdminOrders({
      q,
      status: isInquiryStatus(status) ? status : undefined,
      source: isInquirySource(source) ? source : undefined,
      sort,
      page,
    }),
  ]);
  const t = getServerAdminTranslations(lang);

  const hasFilters = q !== "" || status !== "" || source !== "" || sort !== "newest";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.common.orders}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.reviewCustomerRequests}
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
          title={t.common.couldNotLoadOrders}
          description={t.common.pleaseTryAgain}
        />
      ) : listResult.data.items.length === 0 ? (
        hasFilters ? (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title={t.common.noMatchingOrders}
              description={t.common.noOrdersMatchFilters}
              icon={<SearchX className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin/orders" />}
              >
                {t.common.clearSearchFilters}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title={t.common.noOrdersYet}
              description={t.common.ordersAppearHere}
              icon={<Inbox className="size-8 text-muted-foreground" />}
            />
          </div>
        )
      ) : (
        <div>
          <p className="sr-only" role="status">
            {t.common.showingProducts.replace("{total}", listResult.data.total.toLocaleString())}
          </p>
          <OrderTable data={listResult.data} query={queryString} />
        </div>
      )}
    </div>
  );
}