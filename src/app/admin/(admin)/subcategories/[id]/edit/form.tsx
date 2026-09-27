"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionError } from "@/components/admin/section-error";
import {
  updateSubcategoryAction,
  type UpdateSubcategoryActionResult,
} from "@/lib/actions/subcategories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminSubcategoryDetail } from "@/lib/admin/subcategories";

interface AdminSubcategoryEditFormProps {
  subcategory: AdminSubcategoryDetail | null;
  categories: Array<{ id: string; name: string }>;
}

export function AdminSubcategoryEditForm({ subcategory, categories }: AdminSubcategoryEditFormProps) {
  const [state, formAction] = useActionState<
    UpdateSubcategoryActionResult | undefined,
    FormData
  >(updateSubcategoryAction, undefined);

  if (!subcategory) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Link
          href="/admin/subcategories"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to subcategories
        </Link>
        <SectionError
          title="Could not load this subcategory"
          description="We could not load this subcategory. It may have been deleted, or something went wrong. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/subcategories"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 text-muted-foreground"
        )}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to subcategories
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit Subcategory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the subcategory details below.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={subcategory.id} />

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
            defaultValue={subcategory.name}
            autoComplete="off"
            aria-invalid={Boolean(state?.fieldErrors?.name)}
          />
          {state?.fieldErrors?.name && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            maxLength={100}
            defaultValue={subcategory.slug}
            autoComplete="off"
            aria-invalid={Boolean(state?.fieldErrors?.slug)}
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. Used in URLs.
          </p>
          {state?.fieldErrors?.slug && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Parent Category</Label>
          {categories.length > 0 ? (
            <Select name="categoryId" defaultValue={subcategory.categoryId} required>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: { id: string; name: string }) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="categoryId"
              value={subcategory.categoryName}
              readOnly
              className="text-muted-foreground"
            />
          )}
          {state?.fieldErrors?.categoryId && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.fieldErrors.categoryId[0]}
            </p>
          )}
        </div>

        <Button type="submit" disabled={state && !state.ok}>
          {state && !state.ok ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}