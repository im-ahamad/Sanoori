"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  createCategoryAction,
  type CreateCategoryActionResult,
} from "@/lib/actions/categories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

export function AdminCategoryNewForm() {
  const t = useAdminTranslations();
  const [state, formAction] = useActionState<
    CreateCategoryActionResult | undefined,
    FormData
  >(createCategoryAction, undefined);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/categories"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 text-muted-foreground"
        )}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.common.backToCategories}
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.common.newCategory}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.common.newCategoryDesc}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state && !state.ok && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">{t.common.categoryName}</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder={t.common.categoryNamePlaceholder}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">{t.common.categorySlug}</Label>
          <Input
            id="slug"
            name="slug"
            required
            maxLength={100}
            placeholder={t.common.categorySlugPlaceholder}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            {t.common.categorySlugHint}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">{t.common.categoryDescription}</Label>
          <Textarea
            id="description"
            name="description"
            maxLength={500}
            rows={3}
            placeholder={t.common.categoryDescriptionPlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="image">{t.common.categoryImageLabel}</Label>
          <Input
            id="image"
            name="image"
            maxLength={500}
            placeholder={t.common.categoryImagePlaceholder}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            {t.common.categoryImageHint}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">{t.common.categoryDisplayOrderLabel}</Label>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="0"
            value="0"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            {t.common.categoryDisplayOrderHint}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="isActive" name="isActive" checked={true} />
          <Label htmlFor="isActive" className="mb-0">
            {t.common.categoryActive}
          </Label>
        </div>

        <Button type="submit" disabled={state && !state.ok}>
          {state && !state.ok ? t.common.savingCategory : t.common.createCategory}
        </Button>
      </form>
    </div>
  );
}