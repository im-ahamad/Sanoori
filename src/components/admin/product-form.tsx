"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { Availability } from "@/generated/prisma";
import { slugify } from "@/lib/slug";
import { availabilityLabels, availabilityValues } from "@/lib/validators/product";
import type { ProductActionState } from "@/lib/actions/products";
import type { AdminProductOption } from "@/lib/admin/products";
import type { AdminProductImage } from "@/lib/admin/product-images";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ProductActionState = undefined;

export interface ProductFormInitialValues {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  categoryId: string;
  subcategoryId: string;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: Record<string, string> | null;
  variants: Array<Record<string, string>>;
  availability: Availability;
  featured: boolean;
  isActive: boolean;
  images?: AdminProductImage[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  action: (
    prevState: ProductActionState,
    formData: FormData
  ) => Promise<ProductActionState>;
  categories: AdminProductOption[];
  initial?: ProductFormInitialValues | null;
}

interface KeyValueRow {
  key: string;
  value: string;
}

function entriesToRows(entries: Record<string, string> | null): KeyValueRow[] {
  if (!entries) return [];
  return Object.entries(entries).map(([key, value]) => ({ key, value }));
}

function variantsToRows(variants: Array<Record<string, string>>): KeyValueRow[] {
  return variants.flatMap((variant) =>
    Object.entries(variant).map(([key, value]) => ({ key, value }))
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {errors[0]}
    </p>
  );
}

interface KeyValueEditorProps {
  label: string;
  hint: string;
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  errors?: string[];
}

function KeyValueEditor({
  label,
  hint,
  rows,
  onChange,
  errors,
}: KeyValueEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => onChange([...rows, { key: "", value: "" }])}
        >
          <Plus className="size-3" aria-hidden="true" />
          Add row
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No {label.toLowerCase()} yet. Add a row to get started.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <li
              key={index}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
            >
              <Input
                value={row.key}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, key: event.target.value };
                  onChange(next);
                }}
                placeholder={index === 0 ? `e.g. Material` : undefined}
                aria-label={`${label} row ${index + 1} name`}
              />
              <Input
                value={row.value}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, value: event.target.value };
                  onChange(next);
                }}
                placeholder={index === 0 ? `e.g. Porcelain` : undefined}
                aria-label={`${label} row ${index + 1} value`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  const next = rows.filter((_, itemIndex) => itemIndex !== index);
                  onChange(next);
                }}
                aria-label={`Remove ${label} row ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <FieldError errors={errors} />
    </div>
  );
}

export function ProductForm({
  mode,
  action,
  categories,
  initial,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugAuto, setSlugAuto] = useState(mode === "create");
  const [productCode, setProductCode] = useState(initial?.productCode ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    initial?.subcategoryId ?? ""
  );
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState(initial?.features ?? []);
  const [specifications, setSpecifications] = useState<KeyValueRow[]>(
    entriesToRows(initial?.specifications ?? null)
  );
  const [variants, setVariants] = useState<KeyValueRow[]>(
    variantsToRows(initial?.variants ?? [])
  );
  const [availability, setAvailability] = useState<Availability>(
    initial?.availability ?? "ON_REQUEST"
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  );
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  const handleNameChange = (value: string) => {
    setName(value);
    if (slugAuto) setSlug(slugify(value));
  };

  const regenerateSlug = () => {
    setSlug(slugify(name));
    setSlugAuto(true);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    const nextCategory = categories.find((category) => category.id === value);
    const stillValid = nextCategory?.subcategories.some(
      (subcategory) => subcategory.id === subcategoryId
    );
    if (!stillValid) setSubcategoryId("");
  };

  const onNameChange = (value: string) => {
    if (mode === "edit") {
      setName(value);
      return;
    }
    handleNameChange(value);
  };

  const stateErrors = state?.status === "error" ? state.fieldErrors : undefined;
  const formError =
    state?.status === "error" ? state.message : undefined;

  const featuresText = features.join("\n");

  return (
    <form action={formAction} noValidate aria-busy={pending}>
      {mode === "edit" ? (
        <input type="hidden" name="productId" value={initial?.id ?? ""} />
      ) : null}

      <div className="space-y-8">
        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        ) : null}

        {/* ===== Basic information ===== */}
        <section aria-labelledby="section-basic" className="space-y-4">
          <div>
            <h2
              id="section-basic"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Basic information
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The product name and slug are used across the catalogue and in
              product URLs.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="e.g. Wall-Mount Commode"
              maxLength={200}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.name)}
            />
            <FieldError errors={stateErrors?.name} />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugAuto(false);
                  }}
                  placeholder="e.g. wall-mount-commode"
                  maxLength={200}
                  disabled={pending}
                  className="font-mono text-sm"
                  aria-invalid={Boolean(stateErrors?.slug)}
                  aria-describedby="slug-hint"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={regenerateSlug}
                  title="Regenerate the slug from the product name"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
              </div>
              <p id="slug-hint" className="text-xs text-muted-foreground">
                URL slug. Lowercase letters, numbers, and dashes only.{" "}
                {slugAuto
                  ? "Auto-generated from the name until you edit it."
                  : ""}
              </p>
              <FieldError errors={stateErrors?.slug} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-code">Product code</Label>
              <Input
                id="product-code"
                name="productCode"
                value={productCode}
                onChange={(event) => setProductCode(event.target.value)}
                placeholder="Optional, e.g. SW-100"
                maxLength={100}
                disabled={pending}
                className="font-mono text-sm"
                aria-invalid={Boolean(stateErrors?.productCode)}
              />
              <p className="text-xs text-muted-foreground">
                Your internal reference, if you use one. Does not affect URLs.
              </p>
              <FieldError errors={stateErrors?.productCode} />
            </div>
          </div>
        </section>

        {/* ===== Category & availability ===== */}
        <section aria-labelledby="section-listing" className="space-y-4">
          <div>
            <h2
              id="section-listing"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Category &amp; availability
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Where the product sits in the catalogue and how it can be ordered.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="categoryId"
                value={categoryId}
                onValueChange={(value) => handleCategoryChange(value ?? "")}
              >
                <SelectTrigger
                  id="category"
                  className="w-full"
                  disabled={pending}
                >
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
              <FieldError errors={stateErrors?.categoryId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              {subcategoryOptions.length > 0 ? (
                <Select
                  name="subcategoryId"
                  value={subcategoryId || null}
                  onValueChange={(value) => setSubcategoryId(value ?? "")}
                >
                  <SelectTrigger
                    id="subcategory"
                    className="w-full"
                    disabled={pending}
                  >
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {subcategoryOptions.map((subcategory) => (
                      <SelectItem
                        key={subcategory.id}
                        value={subcategory.id}
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="subcategory"
                  value={subcategoryId ? "Selected" : ""}
                  readOnly
                  disabled={pending}
                  placeholder={
                    categoryId
                      ? "No subcategories for this category"
                      : "Select a category first"
                  }
                  className="text-muted-foreground"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Only subcategories of the selected category are available.
              </p>
              <FieldError errors={stateErrors?.subcategoryId} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={availability}
                onValueChange={(value) =>
                  setAvailability((value as Availability) ?? "ON_REQUEST")
                }
              >
                <SelectTrigger
                  id="availability"
                  className="w-full"
                  disabled={pending}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availabilityValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {availabilityLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={stateErrors?.availability} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Featured product
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Highlight this product on the public catalogue.
                </p>
                <FieldError errors={stateErrors?.featured} />
              </div>
              <Switch
                checked={featured}
                onCheckedChange={setFeatured}
                disabled={pending}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Product active
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Inactive products are hidden from the public catalogue.
                </p>
                <FieldError errors={stateErrors?.isActive} />
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={pending}
              />
            </div>
          </div>
        </section>

        {/* ===== Descriptions ===== */}
        <section aria-labelledby="section-description" className="space-y-4">
          <div>
            <h2
              id="section-description"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Descriptions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A short summary for listings and a full description for the
              product page.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-description">Short description</Label>
            <Textarea
              id="short-description"
              name="shortDescription"
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="A one or two sentence summary of the product."
              rows={3}
              maxLength={300}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.shortDescription)}
            />
            <div className="flex items-center justify-between gap-2">
              <FieldError errors={stateErrors?.shortDescription} />
              <p className="ml-auto text-right text-xs text-muted-foreground">
                {shortDescription.length}/300
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Full product details. Plain text is fine — rich formatting comes later."
              rows={8}
              maxLength={20_000}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.description)}
            />
            <FieldError errors={stateErrors?.description} />
          </div>
        </section>

        {/* ===== Structured data ===== */}
        <section aria-labelledby="section-structured" className="space-y-4">
          <div>
            <h2
              id="section-structured"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Features, specifications &amp; variants
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Structured data shown readably across the catalogue.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(event) =>
                setFeatures(event.target.value.split("\n"))
              }
              placeholder={"One feature per line, e.g.\nWater-resistant glaze\nEasy-clean surface"}
              rows={5}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.features)}
            />
            <div className="flex items-center justify-between gap-2">
              <FieldError errors={stateErrors?.features} />
              <p className="ml-auto text-right text-xs text-muted-foreground">
                One per line
              </p>
            </div>
          </div>

          <KeyValueEditor
            label="Specifications"
            hint="Key/value pairs such as Material → Porcelain."
            rows={specifications}
            onChange={setSpecifications}
            errors={stateErrors?.specifications}
          />

          <KeyValueEditor
            label="Variants"
            hint="Options such as Color → Grey. Each row becomes a variant."
            rows={variants}
            onChange={setVariants}
            errors={stateErrors?.variants}
          />
        </section>

        {/* ===== Images ===== */}
        <section aria-labelledby="section-images" className="space-y-4">
          <div>
            <h2
              id="section-images"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              Images
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Product photos. The first image is the primary image shown across
              the catalogue.
            </p>
          </div>

          {mode === "edit" && initial?.id ? (
            <ProductImageManager
              productId={initial.id}
              productName={initial.name}
              initialImages={initial.images ?? []}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <Package className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="text-sm text-muted-foreground">
                Save the product first — you can add images on the next screen.
              </div>
            </div>
          )}
        </section>

        {/* ===== Hidden fields ===== */}
        <input type="hidden" name="features" value={JSON.stringify(features)} />
        <input
          type="hidden"
          name="specifications"
          value={JSON.stringify(specifications)}
        />
        <input
          type="hidden"
          name="variants"
          value={JSON.stringify(variants)}
        />
        <input type="hidden" name="availability" value={availability} />
        <input type="hidden" name="featured" value={featured ? "on" : "off"} />
        <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />

        {/* ===== Actions ===== */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            render={<Link href="/admin/products" />}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {mode === "create" ? "Creating product…" : "Saving changes…"}
              </>
            ) : mode === "create" ? (
              <>
                Create product
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}