"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChevronRight, Edit, SquareKanban, Tag, Trash2 } from "lucide-react";
import type { AdminCategoryList } from "@/lib/admin/categories";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  deleteCategoryAction,
  type DeleteCategoryActionResult,
} from "@/lib/actions/categories";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

interface CategoryTableProps {
  data: AdminCategoryList;
}

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { products: number };
}

function CategoryRow({
  category,
  level = 0,
  t,
}: {
  category: AdminCategoryList["items"][0];
  level?: number;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  const indent = level * 24;

  return (
    <>
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
              href={`/admin/categories/${category.id}/edit`}
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <Tag className="size-4 text-gold shrink-0" aria-hidden="true" />
              {category.name}
            </Link>
          </div>
        </td>
        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
          {category.slug}
        </td>
        <td className="hidden max-w-56 px-4 py-3 lg:table-cell">
          <span className="line-clamp-1 text-muted-foreground">
            {category.description ?? "—"}
          </span>
        </td>
        <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
          {category._count.products} {t.common.productsInCategory}
        </td>
        <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
          {category._count.subcategories} {t.common.subcategoriesInCategory}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              category.isActive
                ? "bg-green/10 text-green"
                : "bg-muted-foreground/10 text-muted-foreground"
            }`}
          >
            {category.isActive ? t.common.activeStatus : t.common.inactiveStatus}
          </span>
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(category.createdAt)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label={`${t.common.edit} ${category.name}`}
            >
              <Edit className="size-4" aria-hidden="true" />
            </Link>
            <CategoryDeleteButton categoryId={category.id} categoryName={category.name} t={t} />
          </div>
        </td>
      </tr>
      {category.subcategories && category.subcategories.length > 0 && (
        <>
          {category.subcategories.map((sub) => (
            <SubcategoryRow key={sub.id} subcategory={sub} level={level + 1} t={t} />
          ))}
        </>
      )}
    </>
  );
}

function SubcategoryRow({
  subcategory,
  level = 0,
  t,
}: {
  subcategory: SubcategoryItem;
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
            href={`/admin/categories/${subcategory.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <Tag className="size-4 text-gold shrink-0" aria-hidden="true" />
            {subcategory.name}
          </Link>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {subcategory.slug}
      </td>
      <td className="hidden max-w-56 px-4 py-3 lg:table-cell">
        <span className="line-clamp-1 text-muted-foreground">—</span>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
        {subcategory._count.products} {t.common.productsInCategory}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
        0 {t.common.subcategoriesInCategory}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted-foreground/10 text-muted-foreground">
          {t.common.inactiveStatus}
        </span>
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
            href={`/admin/categories/${subcategory.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={`${t.common.edit} ${subcategory.name}`}
          >
            <Edit className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function CategoryDeleteButton({
  categoryId,
  categoryName,
  t,
}: {
  categoryId: string;
  categoryName: string;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  const [state, formAction] = useActionState<
    DeleteCategoryActionResult | undefined,
    FormData
  >(deleteCategoryAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={categoryId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={state?.ok === false || !state}
        className="text-destructive hover:bg-destructive/10"
        aria-label={`${t.common.deleteCategory} ${categoryName}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

export function CategoryTable({ data }: CategoryTableProps) {
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
                    {t.common.category}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                    {t.common.slug}
                  </th>
                  <th scope="col" className="hidden max-w-56 px-4 py-3 font-semibold lg:table-cell">
                    {t.common.description}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    {t.common.products}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    {t.common.subcategories}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {t.common.status}
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
                {data.items.map((category) => (
                  <CategoryRow key={category.id} category={category} t={t} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <ul className="divide-y divide-border lg:hidden">
            {data.items.map((category) => (
              <li key={category.id} className="p-4">
                <CategoryCard category={category} t={t} />
                {category.subcategories && category.subcategories.length > 0 && (
                  <ul className="mt-3 space-y-3 border-l-2 border-border pl-4 ml-6">
                    {category.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <SubcategoryCard subcategory={sub} t={t} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function CategoryCard({
  category,
  t,
}: {
  category: AdminCategoryList["items"][0];
  t: ReturnType<typeof useAdminTranslations>;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <Tag className="size-4 text-gold shrink-0 inline-block mr-2" aria-hidden="true" />
            {category.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{category.slug}</p>
          {category.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            category.isActive
              ? "bg-green/10 text-green"
              : "bg-muted-foreground/10 text-muted-foreground"
          }`}
        >
          {category.isActive ? t.common.activeStatus : t.common.inactiveStatus}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {category._count.products} {t.common.productsInCategory}{" "}
        ·{" "}
        {category._count.subcategories} {t.common.subcategoriesInCategory}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        {t.common.created}{" "}
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(category.createdAt)}
      </p>

      <div className="mt-3 flex items-center justify-end gap-1">
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={`${t.common.edit} ${category.name}`}
        >
          <Edit className="size-4" aria-hidden="true" />
        </Link>
        <CategoryDeleteButton categoryId={category.id} categoryName={category.name} t={t} />
      </div>
    </div>
  );
}

function SubcategoryCard({
  subcategory,
  t,
}: {
  subcategory: SubcategoryItem;
  t: ReturnType<typeof useAdminTranslations>;
}) {
  return (
    <div className="pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/categories/${subcategory.id}/edit`}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <SquareKanban className="size-4 text-gold shrink-0 inline-block mr-2" aria-hidden="true" />
            {subcategory.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{subcategory.slug}</p>
        </div>
        <span className="inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-muted-foreground/10 text-muted-foreground">
          {t.common.inactiveStatus}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {subcategory._count.products} {t.common.productsInCategory}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        {t.common.created}{" "}
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(subcategory.createdAt)}
      </p>

      <div className="mt-2 flex items-center justify-end">
        <Link
          href={`/admin/categories/${subcategory.id}/edit`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={`${t.common.edit} ${subcategory.name}`}
        >
          <Edit className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}