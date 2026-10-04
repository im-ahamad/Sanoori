import Link from "next/link";
import { ChevronLeft, FolderOpen } from "lucide-react";
import { getAdminProductOptions } from "@/lib/admin/products";
import { createProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { SectionError } from "@/components/admin/section-error";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServerAdminTranslations } from "@/lib/i18n/server-translations";

export const metadata = {
  title: "New Product",
};

export default async function AdminNewProductPage() {
  const result = await getAdminProductOptions();
  const t = getServerAdminTranslations();

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
          {t.common.backToProducts}
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.common.newProduct}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.newProductDesc}
        </p>
      </div>

      {!result.ok ? (
        <SectionError
          title={t.common.couldNotLoadCategories}
          description={t.common.couldNotLoadCategoriesDesc}
        />
      ) : result.data.length === 0 ? (
        <div className="rounded-lg border border-border bg-background">
          <EmptyState
            title={t.common.noCategoriesYet}
            description={t.common.noCategoriesYetDesc}
            icon={<FolderOpen className="size-8 text-muted-foreground" />}
          />
          <div className="flex justify-center pb-10">
            <Button variant="outline" render={<Link href="/admin/products" />}>
              {t.common.backToProducts}
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