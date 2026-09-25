"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SectionError } from "@/components/admin/section-error";
import {
  updateCategoryAction,
  type UpdateCategoryActionResult,
} from "@/lib/actions/categories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/lib/admin/categories";

interface AdminCategoryEditFormProps {
  category: AdminCategory | null;
}

export function AdminCategoryEditForm({ category }: AdminCategoryEditFormProps) {
  const [state, formAction] = useActionState<
    UpdateCategoryActionResult | undefined,
    FormData
  >(updateCategoryAction, undefined);

  if (!category) {
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
          Back to categories
        </Link>
        <SectionError
          title="Could not load this category"
          description="We could not load this category. It may have been deleted, or something went wrong. Please try again."
        />
      </div>
    );
  }

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
        Back to categories
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit Category
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the category details below.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={category.id} />

        {state && !state.ok && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            defaultValue={category.name}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            maxLength={100}
            defaultValue={category.slug}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. Used in URLs.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            maxLength={500}
            rows={3}
            defaultValue={category.description ?? ""}
            placeholder="Optional description for this category"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            maxLength={500}
            defaultValue={category.image ?? ""}
            placeholder="https://example.com/image.jpg"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Optional image for category display.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="0"
            defaultValue={String(category.displayOrder)}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Lower numbers appear first.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="isActive" name="isActive" checked={category.isActive} />
          <Label htmlFor="isActive" className="mb-0">
            Active
          </Label>
        </div>

        <Button type="submit" disabled={state && !state.ok}>
          {state && !state.ok ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}