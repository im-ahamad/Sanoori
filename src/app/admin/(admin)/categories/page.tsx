import Link from "next/link";
import { Tag, TagPlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminCategories } from "@/lib/admin/categories";
import { CategoryTable } from "@/components/admin/category-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashBanner, type FlashKind } from "@/components/admin/flash-banner";

export const metadata = {
  title: "Categories",
};

function stringParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminCategoriesPage() {
  const listResult = await listAdminCategories();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your catalogue into categories and subcategories.
          </p>
        </div>
        <Button render={<Link href="/admin/categories/new" />}>
          <TagPlus className="size-4" aria-hidden="true" />
          Add Category
        </Button>
      </div>

      {!listResult.ok ? (
        <SectionError
          title="Could not load categories"
          description="We could not load your categories. Please try again in a moment."
        />
      ) : listResult.data.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title="No categories yet"
            description="Create your first category to start organizing products."
            icon={<Tag className="size-8 text-muted-foreground" />}
          />
          <div className="flex justify-center pb-10">
            <Button render={<Link href="/admin/categories/new" />}>
              <TagPlus className="size-4" aria-hidden="true" />
              Add Category
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="sr-only" role="status">
            Showing {listResult.data.items.length} categories
          </p>
          <CategoryTable data={listResult.data} />
        </div>
      )}
    </div>
  );
}