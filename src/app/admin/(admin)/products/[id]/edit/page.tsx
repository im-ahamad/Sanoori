import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getAdminProductDetail,
  getAdminProductOptions,
} from "@/lib/admin/products";
import { updateProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { FlashBanner } from "@/components/admin/flash-banner";
import { SectionError } from "@/components/admin/section-error";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Edit Product",
};

export default async function AdminEditProductPage(
  props: PageProps<"/admin/products/[id]/edit">
) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const productId = params.id;
  const justCreated = searchParams.created === "1";

  const [detailResult, optionsResult] = await Promise.all([
    getAdminProductDetail(productId),
    getAdminProductOptions(),
  ]);

  if (!detailResult.ok || !optionsResult.ok) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
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
        <SectionError
          title="Could not load this product"
          description="We could not load this product. It may have been deleted, or something went wrong. Please try again."
        />
      </div>
    );
  }

  const product = detailResult.data;
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        {justCreated ? <FlashBanner kind="created" /> : null}
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
          Edit product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details of &ldquo;{product.name}&rdquo;. Changes appear on
          the public catalogue in a later step.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <ProductForm
          mode="edit"
          action={updateProductAction}
          categories={optionsResult.data}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            productCode: product.productCode ?? "",
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId ?? "",
            shortDescription: product.shortDescription ?? "",
            description: product.description ?? "",
            features: product.features,
            specifications: product.specifications,
            variants: product.variants,
            availability: product.availability,
            featured: product.featured,
            isActive: product.isActive,
            material: product.material ?? "",
            size: product.size ?? "",
            colorFinish: product.colorFinish ?? "",
            showOnHome: product.showOnHome ?? true,
            showOnProducts: product.showOnProducts ?? true,
            images: product.images,
          }}
        />
      </div>
    </div>
  );
}