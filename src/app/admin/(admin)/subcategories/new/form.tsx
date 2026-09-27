"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSubcategoryAction,
  type CreateSubcategoryActionResult,
} from "@/lib/actions/subcategories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSubcategoryNewFormProps {
  categories: Array<{ id: string; name: string }>;
}

export function AdminSubcategoryNewForm({ categories }: AdminSubcategoryNewFormProps) {
  const [state, formAction] = useActionState<
    CreateSubcategoryActionResult | undefined,
    FormData
  >(createSubcategoryAction, undefined);

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
          New Subcategory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new subcategory to organize products within a category.
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
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g., Wall-Mount Commode"
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
            placeholder="e.g., wall-mount-commode"
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
            <Select name="categoryId" required>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="categoryId"
              value=""
              readOnly
              placeholder="No active categories available"
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
          {state && !state.ok ? "Creating…" : "Create Subcategory"}
        </Button>
      </form>
    </div>
  );
}