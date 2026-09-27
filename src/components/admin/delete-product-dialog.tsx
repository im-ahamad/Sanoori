"use client";

import { useActionState } from "react";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { deleteProductAction, type ProductActionState } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

const initialState: ProductActionState = undefined;

interface DeleteProductDialogProps {
  productId: string;
  productName: string;
}

export function DeleteProductDialog({
  productId,
  productName,
}: DeleteProductDialogProps) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialState
  );
  const t = useAdminTranslations();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            <span className="sr-only">{t.common.deleteProduct} {productName}</span>
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{t.common.deleteProductConfirm.replace("{name}", productName)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteProductDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state?.status === "error" ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <form action={formAction} aria-busy={pending}>
          <input type="hidden" name="productId" value={productId} />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{t.common.cancel}</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t.common.deleting}
                </>
              ) : (
                t.common.deleteProductAction
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}