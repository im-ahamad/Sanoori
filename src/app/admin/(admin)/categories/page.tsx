import Link from "next/link";
import { Tag, TagPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminCategories } from "@/lib/admin/categories";
import { CategoryTable } from "@/components/admin/category-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { cookies } from "next/headers";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "Categories",
};

async function getLanguage(): Promise<"en" | "bn"> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("sanoori-lang")?.value;
  return lang === "bn" ? "bn" : "en";
}

export default async function AdminCategoriesPage() {
  const [lang, listResult] = await Promise.all([
    getLanguage(),
    listAdminCategories(),
  ]);
  const t = getServerAdminTranslations(lang);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.common.categories}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.common.organizeCatalogue}
          </p>
        </div>
        <Button render={<Link href="/admin/categories/new" />}>
          <TagPlus className="size-4" aria-hidden="true" />
          {t.common.addCategory}
        </Button>
      </div>

      {!listResult.ok ? (
        <SectionError
          title={t.common.couldNotLoadCategories}
          description={t.common.pleaseTryAgain}
        />
      ) : listResult.data.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title={t.common.noCategoriesYet}
            description={t.common.addCategoryDesc}
            icon={<Tag className="size-8 text-muted-foreground" />}
          />
          <div className="flex justify-center pb-10">
            <Button render={<Link href="/admin/categories/new" />}>
              <TagPlus className="size-4" aria-hidden="true" />
              {t.common.addCategory}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="sr-only" role="status">
            {t.common.showing} {listResult.data.items.length} {t.common.categories}
          </p>
          <CategoryTable data={listResult.data} />
        </div>
      )}
    </div>
  );
}