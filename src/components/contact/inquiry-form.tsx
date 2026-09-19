"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Package,
  Send,
  X,
} from "lucide-react";
import {
  submitInquiryAction,
  type InquiryActionState,
} from "@/lib/actions/inquiries";
import type { PublicProductOption } from "@/lib/public/catalogue";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: InquiryActionState = undefined;

interface InquiryFormProps {
  productOptions: PublicProductOption[];
  initialProductSlug: string;
  whatsappHref: string | null;
}

function getFieldError(state: InquiryActionState, field: string): string | undefined {
  if (state?.status !== "error" || !state.fieldErrors) return undefined;
  const errors = state.fieldErrors[field];
  return Array.isArray(errors) && errors.length > 0 ? errors[0] : undefined;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {error}
    </p>
  );
}

interface ProductCardProps {
  option: PublicProductOption;
  name: string;
  onClear: () => void;
}

function ProductCard({ option, name, onClear }: ProductCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
      {option.imageUrl ? (
        <Image
          src={option.imageUrl}
          alt=""
          width={96}
          height={72}
          unoptimized
          sizes="96px"
          className="h-[72px] w-24 flex-shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-[72px] w-24 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Package className="size-6" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Requesting pricing for
        </p>
        <h3 className="mt-0.5 truncate font-heading text-sm font-semibold text-foreground">
          {name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {option.categoryName}
          {option.productCode ? ` · ${option.productCode}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" aria-hidden="true" />
        Remove
      </button>
    </div>
  );
}

export function InquiryForm({
  productOptions,
  initialProductSlug,
  whatsappHref,
}: InquiryFormProps) {
  const [state, formAction, pending] = useActionState(
    submitInquiryAction,
    initialState
  );
  const [productSlug, setProductSlug] = useState(initialProductSlug);
  const successRef = useRef<HTMLDivElement>(null);

  const optionsBySlug = useMemo(() => {
    const map = new Map<string, PublicProductOption>();
    for (const option of productOptions) map.set(option.slug, option);
    return map;
  }, [productOptions]);

  const selectedOption = productSlug
    ? optionsBySlug.get(productSlug)
    : undefined;

  const groups = useMemo(() => {
    const byCategory = new Map<string, PublicProductOption[]>();
    for (const option of productOptions) {
      const list = byCategory.get(option.categorySlug) ?? [];
      list.push(option);
      byCategory.set(option.categorySlug, list);
    }
    return Array.from(byCategory, ([categorySlug, options]) => ({
      categorySlug,
      categoryName: options[0].categoryName,
      options,
    }));
  }, [productOptions]);

  useEffect(() => {
    if (state?.status === "success") {
      successRef.current?.focus();
    }
  }, [state]);

  const nameError = getFieldError(state, "customerName");
  const phoneError = getFieldError(state, "phone");
  const emailError = getFieldError(state, "email");
  const productError = getFieldError(state, "productSlug");
  const quantityError = getFieldError(state, "quantity");
  const messageError = getFieldError(state, "message");

  if (state?.status === "success") {
    return (
      <section
        ref={successRef}
        tabIndex={-1}
        aria-labelledby="inquiry-success-title"
        className="rounded-xl border border-border bg-card p-8 focus:outline-none sm:p-10"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="inquiry-success-title"
              className="font-heading text-xl font-bold tracking-tight text-foreground"
            >
              Your inquiry has been received
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Thank you for getting in touch. Our team will review your request
              and contact you shortly using the details you provided.
            </p>
          </div>
        </div>

        {selectedOption && (
          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              You asked about
            </p>
            <p className="mt-1 font-heading text-sm font-semibold text-foreground">
              {selectedOption.name}
              {selectedOption.productCode
                ? ` · ${selectedOption.productCode}`
                : ""}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/products" variant="primary">
            Continue browsing products
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
          {whatsappHref && (
            <ButtonLink
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </ButtonLink>
          )}
          <ButtonLink href="/" variant="outline">
            Return home
          </ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} noValidate className="relative space-y-5">
      {state?.status === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Your name *</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="e.g. Rahim Ahmed"
            autoComplete="name"
            maxLength={200}
            required
            aria-required="true"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "customerName-error" : undefined}
          />
          <FieldError error={nameError} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. +880 1XXX-XXXXXX"
            maxLength={30}
            required
            aria-required="true"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "phone-error" : undefined}
          />
          <FieldError error={phoneError} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={200}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Optional — leave blank if you prefer to be called.
        </p>
        <FieldError error={emailError} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="productSlug">Product</Label>
          <button
            type="button"
            onClick={() => setProductSlug("")}
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Clear selection
          </button>
        </div>
        <select
          id="productSlug"
          name="productSlug"
          value={productSlug}
          onChange={(event) => setProductSlug(event.target.value)}
          aria-invalid={productError ? true : undefined}
          aria-describedby={productError ? "productSlug-error" : "productSlug-hint"}
          className="flex h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20"
        >
          <option value="">Choose a product (optional)</option>
          {groups.map((group) => (
            <optgroup key={group.categorySlug} label={group.categoryName}>
              {group.options.map((option) => (
                <option key={option.id} value={option.slug}>
                  {option.name}
                  {option.productCode ? ` · ${option.productCode}` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p id="productSlug-hint" className="text-xs text-muted-foreground">
          Pick the item you are interested in to speed up your quote.
        </p>
        <FieldError error={productError} />
      </div>

      {selectedOption && (
        <ProductCard
          option={selectedOption}
          name={selectedOption.name}
          onClear={() => setProductSlug("")}
        />
      )}

      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 50"
          maxLength={9}
          pattern="[0-9]*"
          aria-invalid={quantityError ? true : undefined}
          aria-describedby={quantityError ? "quantity-error" : "quantity-hint"}
        />
        <p id="quantity-hint" className="text-xs text-muted-foreground">
          Optional — how many units you may need.
        </p>
        <FieldError error={quantityError} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">How can we help? *</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          required
          aria-required="true"
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "message-error" : "message-hint"}
          placeholder="Tell us about the products and quantities you need, your delivery area, and any specification details."
        />
        <p id="message-hint" className="text-right text-xs text-muted-foreground">
          Up to 2000 characters
        </p>
        <FieldError error={messageError} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" type="text" autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 px-7"
          aria-disabled={pending || undefined}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            <>
              Send request
              <Send className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-xs">
          We typically respond within one business day.
        </p>
      </div>
    </form>
  );
}