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
import { useAdminTranslations } from "@/lib/i18n/use-admin-translations";

const initialState: ProductActionState = undefined;

export interface ProductFormInitialValues {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  features: string[];
  specifications: string[];
  madeIn: string;
  availability: Availability;
  featured: boolean;
  isActive: boolean;
  material: string;
  size: string;
  colorFinish: string;
  showOnHome: boolean;
  showOnProducts: boolean;
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

interface StringArrayEditorProps {
  label: string;
  hint: string;
  placeholder: string;
  rows: string[];
  onChange: (rows: string[]) => void;
  errors?: string[];
}

function StringArrayEditor({
  label,
  hint,
  placeholder,
  rows,
  onChange,
  errors,
}: StringArrayEditorProps) {
  const t = useAdminTranslations();

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => onChange([...rows, ""])}
        >
          <Plus className="size-3" aria-hidden="true" />
          {t.common.addItem}
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t.common.noItemsYet.replace("{label}", label.toLowerCase())}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <li
              key={index}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <Input
                value={row}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                placeholder={index === 0 ? placeholder : undefined}
                aria-label={`${label} ${index + 1}`}
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
                aria-label={`Remove ${label} ${index + 1}`}
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

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {errors[0]}
    </p>
  );
}

export function ProductForm({
  mode,
  action,
  categories,
  initial,
}: ProductFormProps) {
  const t = useAdminTranslations();
  const [state, formAction, pending] = useActionState(action, initialState);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugAuto, setSlugAuto] = useState(mode === "create");
  const [productCode, setProductCode] = useState(initial?.productCode ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    initial?.subcategoryId ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState(initial?.features ?? []);
  const [specifications, setSpecifications] = useState<string[]>(
    initial?.specifications ?? []
  );
  const [madeIn, setMadeIn] = useState(initial?.madeIn ?? "");
  const [availability, setAvailability] = useState<Availability>(
    initial?.availability ?? "ON_REQUEST"
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [size, setSize] = useState(initial?.size ?? "");
  const [colorFinish, setColorFinish] = useState(initial?.colorFinish ?? "");
  const [showOnHome, setShowOnHome] = useState(initial?.showOnHome ?? true);
  const [showOnProducts, setShowOnProducts] = useState(
    initial?.showOnProducts ?? true
  );

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
              {t.common.basicInformation}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.basicInformationDesc}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t.common.name}</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={t.common.namePlaceholder}
              maxLength={200}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.name)}
            />
            <FieldError errors={stateErrors?.name} />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">{t.common.slug}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugAuto(false);
                  }}
                  placeholder={t.common.slugPlaceholder}
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
                  title={t.common.regenerate}
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.common.regenerate}</span>
                </Button>
              </div>
              <p id="slug-hint" className="text-xs text-muted-foreground">
                {t.common.slugHint}
              </p>
              <FieldError errors={stateErrors?.slug} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-code">{t.common.productCode}</Label>
              <Input
                id="product-code"
                name="productCode"
                value={productCode}
                onChange={(event) => setProductCode(event.target.value)}
                placeholder={t.common.productCodePlaceholder}
                maxLength={100}
                disabled={pending}
                className="font-mono text-sm"
                aria-invalid={Boolean(stateErrors?.productCode)}
              />
              <p className="text-xs text-muted-foreground">
                {t.common.productCodeHint}
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
              {t.common.categoryAvailability}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.categoryAvailabilityDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">{t.common.category}</Label>
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
                  <SelectValue placeholder={t.common.selectCategory} />
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
              <Label htmlFor="subcategory">{t.common.subcategory}</Label>
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
                    <SelectValue placeholder={t.common.none} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t.common.none}</SelectItem>
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
                      ? t.common.noSubcategories
                      : t.common.selectCategoryFirst
                  }
                  className="text-muted-foreground"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {t.common.subcategoryHint}
              </p>
              <FieldError errors={stateErrors?.subcategoryId} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="availability">{t.common.availability}</Label>
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
                      {t.common[value as keyof typeof t.common] ?? availabilityLabels[value]}
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
                  {t.common.featuredProduct}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.common.featuredProductDesc}
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
                  {t.common.productActive}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.common.productActiveDesc}
                </p>
                <FieldError errors={stateErrors?.isActive} />
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={pending}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t.common.showOnHome}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.common.showOnHomeDesc}
                </p>
                <FieldError errors={stateErrors?.showOnHome} />
              </div>
              <Switch
                checked={showOnHome}
                onCheckedChange={setShowOnHome}
                disabled={pending}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t.common.showOnProducts}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.common.showOnProductsDesc}
                </p>
                <FieldError errors={stateErrors?.showOnProducts} />
              </div>
              <Switch
                checked={showOnProducts}
                onCheckedChange={setShowOnProducts}
                disabled={pending}
              />
            </div>
          </div>
        </section>

        {/* ===== Description ===== */}
        <section aria-labelledby="section-description" className="space-y-4">
          <div>
            <h2
              id="section-description"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {t.common.description}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.descriptionHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.common.description}</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.common.descriptionPlaceholder}
              rows={8}
              maxLength={20_000}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.description)}
            />
            <FieldError errors={stateErrors?.description} />
          </div>
        </section>

        {/* ===== Physical attributes ===== */}
        <section aria-labelledby="section-physical" className="space-y-4">
          <div>
            <h2
              id="section-physical"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {t.common.physicalAttributes}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.physicalAttributesDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="material">{t.common.material}</Label>
              <Input
                id="material"
                name="material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                placeholder={t.common.materialPlaceholder}
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(stateErrors?.material)}
              />
              <FieldError errors={stateErrors?.material} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">{t.common.size}</Label>
              <Input
                id="size"
                name="size"
                value={size}
                onChange={(event) => setSize(event.target.value)}
                placeholder={t.common.sizePlaceholder}
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(stateErrors?.size)}
              />
              <FieldError errors={stateErrors?.size} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-finish">{t.common.colorFinish}</Label>
              <Input
                id="color-finish"
                name="colorFinish"
                value={colorFinish}
                onChange={(event) => setColorFinish(event.target.value)}
                placeholder={t.common.colorFinishPlaceholder}
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(stateErrors?.colorFinish)}
              />
              <FieldError errors={stateErrors?.colorFinish} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="made-in">{t.common.madeIn}</Label>
              <Input
                id="made-in"
                name="madeIn"
                value={madeIn}
                onChange={(event) => setMadeIn(event.target.value)}
                placeholder={t.common.madeInPlaceholder}
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(stateErrors?.madeIn)}
              />
              <FieldError errors={stateErrors?.madeIn} />
            </div>
          </div>
        </section>

        {/* ===== Structured data ===== */}
        <section aria-labelledby="section-structured" className="space-y-4">
          <div>
            <h2
              id="section-structured"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {t.common.featuresSpecifications}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.featuresSpecificationsDesc}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">{t.common.features}</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(event) =>
                setFeatures(event.target.value.split("\n"))
              }
              placeholder={t.common.featuresPlaceholder}
              rows={5}
              disabled={pending}
              aria-invalid={Boolean(stateErrors?.features)}
            />
            <div className="flex items-center justify-between gap-2">
              <FieldError errors={stateErrors?.features} />
              <p className="ml-auto text-right text-xs text-muted-foreground">
                {t.common.featuresHint}
              </p>
            </div>
          </div>

          <StringArrayEditor
            label={t.common.specifications}
            hint={t.common.specificationsHint}
            placeholder={t.common.specificationsPlaceholder}
            rows={specifications}
            onChange={setSpecifications}
            errors={stateErrors?.specifications}
          />
        </section>

        {/* ===== Images ===== */}
        <section aria-labelledby="section-images" className="space-y-4">
          <div>
            <h2
              id="section-images"
              className="font-heading text-base font-bold tracking-tight text-foreground"
            >
              {t.common.imagesSection}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.common.imagesSectionDesc}
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
                {t.common.saveFirst}
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
        <input type="hidden" name="madeIn" value={madeIn} />
        <input type="hidden" name="availability" value={availability} />
        <input type="hidden" name="featured" value={featured ? "on" : "off"} />
        <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />
        <input type="hidden" name="material" value={material} />
        <input type="hidden" name="size" value={size} />
        <input type="hidden" name="colorFinish" value={colorFinish} />
        <input type="hidden" name="showOnHome" value={showOnHome ? "on" : "off"} />
        <input
          type="hidden"
          name="showOnProducts"
          value={showOnProducts ? "on" : "off"}
        />

        {/* ===== Actions ===== */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            render={<Link href="/admin/products" />}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {mode === "create" ? t.common.creatingProduct : t.common.savingChanges}
              </>
            ) : mode === "create" ? (
              <>
                {t.common.createProduct}
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            ) : (
              <>
                {t.common.saveChanges}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}