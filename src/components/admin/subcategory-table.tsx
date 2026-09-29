"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChevronLeft, ChevronRight, Edit, SquareKanban, Trash2 } from "lucide-react";
import type { AdminSubcategoryList } from "@/lib/admin/subcategories";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteSubcategoryAction,
  type DeleteSubcategoryActionResult,
} from "@/lib/actions/subcategories";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface SubcategoryTableProps {
  data: AdminSubcategoryList;
  query: string;
}

function SubcategoryRow({
  subcategory,
  level = 0,
  t,
}: {
  subcategory: AdminSubcategoryList["items"][0];
  level?: number;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  const indent = level * 24;

  return (
    <tr
      className="align-middle transition-colors hover:bg-muted/30"
      style={{ paddingLeft: `${indent}px` }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {level > 0 && (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <Link
            href={`/admin/subcategories/${subcategory.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <SquareKanban className="size-4 text-gold shrink-0" aria-hidden="true" />
            {subcategory.name}
          </Link>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {subcategory.slug}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
        {subcategory.categoryName}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
        {subcategory._count.products} {t.common.products}
      </td>
      <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(subcategory.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/subcategories/${subcategory.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={`${t.common.edit} ${subcategory.name}`}
          >
            <Edit className="size-4" aria-hidden="true" />
          </Link>
          <SubcategoryDeleteButton subcategoryId={subcategory.id} subcategoryName={subcategory.name} t={t} />
        </div>
      </td>
    </tr>
  );
}

function SubcategoryDeleteButton({
  subcategoryId,
  subcategoryName,
  t,
}: {
  subcategoryId: string;
  subcategoryName: string;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  const [state, formAction] = useActionState<
    DeleteSubcategoryActionResult | undefined,
    FormData
  >(deleteSubcategoryAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={subcategoryId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={state?.ok === false || !state}
        className="text-destructive hover:bg-destructive/10"
        aria-label={`${t.common.deleteSubcategory} ${subcategoryName}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

function SubcategoryPagination({
  data,
  query,
  t,
}: { data: AdminSubcategoryList; query: string; t: ReturnType<typeof useAdminTranslations> }) {
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
    return search ? `/admin/subcategories?${search}` : "/admin/subcategories";
  };

  return (
    <nav
      aria-label={t.common.productPagination}
      className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground">
        {t.common.showing} {start}–{end} {t.common.of} {total.toLocaleString()} {t.common.subcategories}
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

export function SubcategoryTable({ data, query }: SubcategoryTableProps) {
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
                    {t.common.subcategory}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    {t.common.slug}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">
                    {t.common.category}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    {t.common.products}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    {t.common.created}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((subcategory) => (
                  <SubcategoryRow key={subcategory.id} subcategory={subcategory} t={t} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <ul className="divide-y divide-border lg:hidden">
            {data.items.map((subcategory) => (
              <li key={subcategory.id} className="p-4">
                <SubcategoryCard subcategory={subcategory} t={t} />
              </li>
            ))}
          </ul>

          <SubcategoryPagination data={data} query={query} t={t} />
        </>
      ) : null}
    </div>
  );
}

function SubcategoryCard({
  subcategory,
  t,
}: {
  subcategory: AdminSubcategoryList["items"][0];
  t: ReturnType<typeof useAdminTranslations>;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/subcategories/${subcategory.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <SquareKanban className="size-4 text-gold shrink-0 inline-block mr-2" aria-hidden="true" />
            {subcategory.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{subcategory.slug}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subcategory.categoryName}</p>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {subcategory._count.products} {t.common.products}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        {t.common.created}{" "}
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(subcategory.createdAt)}
      </p>

      <div className="mt-3 flex items-center justify-end gap-1">
        <Link
          href={`/admin/subcategories/${subcategory.id}/edit`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={`${t.common.edit} ${subcategory.name}`}
        >
          <Edit className="size-4" aria-hidden="true" />
        </Link>
        <SubcategoryDeleteButton subcategoryId={subcategory.id} subcategoryName={subcategory.name} t={t} />
      </div>
    </div>
  );
}