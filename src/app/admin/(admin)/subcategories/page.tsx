import Link from "next/link";
import { SquareKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminSubcategories } from "@/lib/admin/subcategories";
import { SubcategoryTable } from "@/components/admin/subcategory-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashBanner, type FlashKind } from "@/components/admin/flash-banner";
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Subcategories",
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

interface SearchParams {
  q?: string;
  category?: string;
  page?: string;
  created?: string;
  updated?: string;
  deleted?: string;
}

export default async function AdminSubcategoriesPage(
  props: { searchParams: Promise<SearchParams> }
) {
  const [lang, searchParams] = await Promise.all([
    getLanguage(),
    props.searchParams,
  ]);
  const t = getServerAdminTranslations(lang);

  const queryParams = {
    q: stringParam(searchParams.q) ?? "",
    categoryId: stringParam(searchParams.category) ?? "",
  };

  const pageNumber = Number(searchParams.page);
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;

  const query = new URLSearchParams();
  if (queryParams.q) query.set("q", queryParams.q);
  if (queryParams.categoryId) query.set("category", queryParams.categoryId);
  const queryString = query.toString();

  const listResult = await listAdminSubcategories({
    q: queryParams.q,
    categoryId: queryParams.categoryId,
    page,
  });

  const flashes: Array<{ key: string; kind: FlashKind }> = [];
  if (searchParams.created === "1") flashes.push({ key: "created", kind: "subcategoryCreated" });
  if (searchParams.updated === "1") flashes.push({ key: "updated", kind: "subcategoryUpdated" });
  if (searchParams.deleted === "1") flashes.push({ key: "deleted", kind: "subcategoryDeleted" });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.common.subcategories}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.common.manageSubcategories}
          </p>
        </div>
        <Button render={<Link href="/admin/subcategories/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          {t.common.addSubcategory}
        </Button>
      </div>

      {flashes.length > 0 && (
        <div className="space-y-2">
          {flashes.map((flash) => (
            <FlashBanner key={flash.key} kind={flash.kind} />
          ))}
        </div>
      )}

      {!listResult.ok ? (
        <SectionError
          title={t.common.couldNotLoadSubcategories}
          description={t.common.pleaseTryAgain}
        />
      ) : listResult.data.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title={t.common.noSubcategoriesYet}
            description={t.common.addSubcategoryDesc}
            icon={<SquareKanban className="size-8 text-muted-foreground" />}
          />
          <div className="flex justify-center pb-10">
            <Button render={<Link href="/admin/subcategories/new" />}>
              <Plus className="size-4" aria-hidden="true" />
              {t.common.addSubcategory}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="sr-only" role="status">
            {t.common.showing} {listResult.data.items.length} {t.common.subcategories}
          </p>
          <SubcategoryTable data={listResult.data} query={queryString} />
        </div>
      )}
    </div>
  );
}