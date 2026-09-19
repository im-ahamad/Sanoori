import Link from "next/link";
import { Package, PackagePlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAdminProductOptions,
  listAdminProducts,
} from "@/lib/admin/products";
import { ProductFilters } from "@/components/admin/product-filters";
import { ProductTable } from "@/components/admin/product-table";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashBanner, type FlashKind } from "@/components/admin/flash-banner";

export const metadata = {
  title: "Products",
};

function stringParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminProductsPage(
  props: PageProps<"/admin/products">
) {
  const searchParams = await props.searchParams;

  const queryParams = {
    q: stringParam(searchParams.q) ?? "",
    category: stringParam(searchParams.category) ?? "",
    availability: stringParam(searchParams.availability) ?? "",
    featured:
      searchParams.featured === "true" || searchParams.featured === "false"
        ? searchParams.featured
        : "",
  };

  const pageNumber = Number(searchParams.page);
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;

  const query = new URLSearchParams();
  if (queryParams.q) query.set("q", queryParams.q);
  if (queryParams.category) query.set("category", queryParams.category);
  if (queryParams.availability)
    query.set("availability", queryParams.availability);
  if (queryParams.featured) query.set("featured", queryParams.featured);
  const queryString = query.toString();

  const [listResult, optionsResult] = await Promise.all([
    listAdminProducts({
      q: queryParams.q,
      categoryId: queryParams.category,
      availability: queryParams.availability,
      featured: queryParams.featured,
      page,
    }),
    getAdminProductOptions(),
  ]);

  const flashes: Array<{ key: string; kind: FlashKind }> = [];
  if (searchParams.created === "1") flashes.push({ key: "created", kind: "created" });
  if (searchParams.updated === "1") flashes.push({ key: "updated", kind: "updated" });
  if (searchParams.deleted === "1") flashes.push({ key: "deleted", kind: "deleted" });

  const hasFilters =
    queryParams.q !== "" ||
    queryParams.category !== "" ||
    queryParams.availability !== "" ||
    queryParams.featured !== "";

  const filtersKnown = optionsResult.ok;
  const filters = filtersKnown
    ? optionsResult.data.map((category) => ({
        id: category.id,
        name: category.name,
      }))
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, organize, and manage your product catalogue.
          </p>
        </div>
        <Button render={<Link href="/admin/products/new" />}>
          <PackagePlus className="size-4" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {flashes.length > 0 ? (
        <div className="space-y-2">
          {flashes.map((flash) => (
            <FlashBanner key={flash.key} kind={flash.kind} />
          ))}
        </div>
      ) : null}

      <ProductFilters categories={filters} values={queryParams} />

      {!listResult.ok ? (
        <SectionError
          title="Could not load products"
          description="We could not load your products. Please try again in a moment."
        />
      ) : listResult.data.items.length === 0 ? (
        hasFilters ? (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No matching products"
              description="No products match your current search or filters. Try different terms or clear the filters."
              icon={<SearchX className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/admin/products" />}
              >
                Clear search and filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-background">
            <EmptyState
              title="No products yet"
              description="Your catalogue is empty. Add your first product to start managing it here."
              icon={<Package className="size-8 text-muted-foreground" />}
            />
            <div className="flex justify-center pb-10">
              <Button render={<Link href="/admin/products/new" />}>
                <PackagePlus className="size-4" aria-hidden="true" />
                Add Product
              </Button>
            </div>
          </div>
        )
      ) : (
        <div>
          <p className="sr-only" role="status">
            Showing {listResult.data.total.toLocaleString()} products
          </p>
          <ProductTable data={listResult.data} query={queryString} />
        </div>
      )}

      {!filtersKnown ? (
        <p className="text-xs text-muted-foreground">
          Category filters are unavailable right now, but search still works.
        </p>
      ) : null}
    </div>
  );
}