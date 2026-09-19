import Link from "next/link";
import { ChevronLeft, FolderOpen } from "lucide-react";
import { getAdminProductOptions } from "@/lib/admin/products";
import { createProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "New Product",
};

export default async function AdminNewProductPage() {
  const result = await getAdminProductOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/admin/products"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to products
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          New product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new product to your catalogue. Everything can be edited later.
        </p>
      </div>

      {!result.ok ? (
        <SectionError
          title="Could not load categories"
          description="We could not load your categories. Please try again in a moment."
        />
      ) : result.data.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title="No categories yet"
            description="You need at least one category before you can add products. Category management arrives in a later step."
            icon={<FolderOpen className="size-8 text-muted-foreground" />}
          />
          <div className="flex justify-center pb-10">
            <Button variant="outline" render={<Link href="/admin/products" />}>
              Back to products
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background p-4 sm:p-6">
          <ProductForm
            mode="create"
            action={createProductAction}
            categories={result.data}
          />
        </div>
      )}
    </div>
  );
}