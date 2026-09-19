import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import type { AdminProductListData } from "@/lib/admin/products";
import { availabilityLabels } from "@/lib/validators/product";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { DeleteProductDialog } from "@/components/admin/delete-product-dialog";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function availabilityBadge(availability: string): string {
  switch (availability) {
    case "IN_STOCK":
      return "bg-emerald-600/10 text-emerald-800";
    case "OUT_OF_STOCK":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-accent text-gold-dark";
  }
}

function AvailabilityBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        availabilityBadge(value)
      )}
    >
      {availabilityLabels[value] ?? value}
    </span>
  );
}

interface PaginationProps {
  data: AdminProductListData;
  query: string;
}

function ProductPagination({ data, query }: PaginationProps) {
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
    return search ? `/admin/products?${search}` : "/admin/products";
  };

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {total.toLocaleString()} products
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
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
            <span className="sr-only">Previous page</span>
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
            <span className="sr-only">Next page</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface ProductTableProps {
  data: AdminProductListData;
  query: string;
}

export function ProductTable({ data, query }: ProductTableProps) {
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
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Availability
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Featured
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold xl:table-cell">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((product) => (
                  <tr key={product.id} className="align-middle transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          {product.name}
                        </Link>
                        {!product.isActive ? (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            Inactive
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">/{product.slug}</span>
                        {product.productCode ? (
                          <span className="ml-2">#{product.productCode}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground/70 xl:hidden">
                        ID {product.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{product.categoryName}</p>
                      {product.subcategoryName ? (
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                          {product.subcategoryName}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityBadge value={product.availability} />
                    </td>
                    <td className="px-4 py-3">
                      <FeaturedToggle
                        productId={product.id}
                        featured={product.featured}
                      />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      <p>{formatDate(product.updatedAt)}</p>
                      <p className="text-[0.65rem] text-muted-foreground/70">
                        Created {formatDate(product.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <DeleteProductDialog
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <ul className="divide-y divide-border lg:hidden">
            {data.items.map((product) => (
              <li key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {product.name}
                    </Link>
                    {!product.isActive ? (
                      <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        Inactive
                      </span>
                    ) : null}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">/{product.slug}</span>
                      {product.productCode ? (
                        <span className="ml-2">#{product.productCode}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground/70">
                      ID {product.id}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <DeleteProductDialog
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AvailabilityBadge value={product.availability} />
                  <FeaturedToggle
                    productId={product.id}
                    featured={product.featured}
                  />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {product.categoryName}
                  {product.subcategoryName ? ` · ${product.subcategoryName}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Updated {formatDate(product.updatedAt)}
                </p>

                <div className="mt-3">
                  <Button variant="outline" size="sm" render={<Link href={`/admin/products/${product.id}/edit`} />}>
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit product
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <ProductPagination data={data} query={query} />
        </>
      ) : null}
    </div>
  );
}