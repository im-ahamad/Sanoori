"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChevronRight, Edit, Tag, Trash2 } from "lucide-react";
import type { AdminCategoryList } from "@/lib/admin/categories";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteCategoryAction,
  type DeleteCategoryActionResult,
} from "@/lib/actions/categories";

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
}: {
  category: AdminCategoryList["items"][0];
  level?: number;
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
          {category._count.products} product{category._count.products !== 1 ? "s" : ""}
        </td>
        <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
          {category._count.subcategories} subcategory{category._count.subcategories !== 1 ? "s" : ""}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              category.isActive
                ? "bg-green/10 text-green"
                : "bg-muted-foreground/10 text-muted-foreground"
            }`}
          >
            {category.isActive ? "Active" : "Inactive"}
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
              aria-label={`Edit ${category.name}`}
            >
              <Edit className="size-4" aria-hidden="true" />
            </Link>
            <CategoryDeleteButton categoryId={category.id} categoryName={category.name} />
          </div>
        </td>
      </tr>
      {category.subcategories && category.subcategories.length > 0 && (
        <>
          {category.subcategories.map((sub) => (
            <SubcategoryRow key={sub.id} subcategory={sub} level={level + 1} />
          ))}
        </>
      )}
    </>
  );
}

function SubcategoryRow({
  subcategory,
  level = 0,
}: {
  subcategory: SubcategoryItem;
  level?: number;
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
        {subcategory._count.products} product{subcategory._count.products !== 1 ? "s" : ""}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
        0 subcategories
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted-foreground/10 text-muted-foreground">
          Inactive
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
            aria-label={`Edit ${subcategory.name}`}
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
}: {
  categoryId: string;
  categoryName: string;
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
        aria-label={`Delete ${categoryName}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

export function CategoryTable({ data }: CategoryTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {data.items.length > 0 ? (
        <>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Category
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                  Slug
                </th>
                <th scope="col" className="hidden max-w-56 px-4 py-3 font-semibold lg:table-cell">
                  Description
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                  Products
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                  Subcategories
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                  Created
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}