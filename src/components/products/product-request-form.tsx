"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useActionState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Package,
  Send,
} from "lucide-react";
import {
  submitProductRequestAction,
  type ProductRequestActionState,
} from "@/lib/actions/product-requests";
import { productRequestSchema } from "@/lib/validators/product-request";
import type { ProductRequestInput } from "@/lib/validators/product-request";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslations, getTranslations, type SupportedLanguage } from "@/lib/i18n/use-translations";

export interface ProductRequestTarget {
  slug: string;
  name: string;
  /** Product code / SKU — shown as the product "Model". */
  model: string | null;
  categoryName: string | null;
  image: { url: string; alt: string | null } | null;
}

interface ProductRequestFormProps {
  product: ProductRequestTarget;
  /** Optional WhatsApp chat link shown after a successful request. */
  whatsappHref?: string | null;
  /** When provided (modal), the success panel shows a "Done" button. */
  onDone?: () => void;
  /** Initial language for server-side rendering to avoid hydration mismatch. */
  initialLang?: SupportedLanguage;
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {error}
    </p>
  );
}

function getFieldError(state: ProductRequestActionState, field: string): string | undefined {
  if (state?.status !== "error" || !state.fieldErrors) return undefined;
  const errors = state.fieldErrors[field];
  return Array.isArray(errors) && errors.length > 0 ? errors[0] : undefined;
}

export function ProductRequestForm({
  product,
  whatsappHref,
  onDone,
  initialLang,
}: ProductRequestFormProps) {
  const tContext = useTranslations();
  const [mounted, setMounted] = useState(false);
  
  // Use initialLang for SSR, switch to context after hydration
  const t = mounted ? tContext : getTranslations(initialLang ?? "en");
  const rq = t.requestQuote as typeof t.requestQuote & {
    productSummary: { requestingPriceFor: string; modelLabel: string };
    form: {
      nameLabel: string;
      namePlaceholder: string;
      contactLabel: string;
      contactPlaceholder: string;
      contactHint: string;
      quantityLabel: string;
      quantityPlaceholder: string;
      quantityHint: string;
      messageLabel: string;
      messageOptional: string;
      messagePlaceholder: string;
      messageHint: string;
      submitButton: string;
      submittingButton: string;
      noObligation: string;
    };
    success: {
      thankYou: string;
      requestReady: string;
      productLabel: string;
      quantityLabel: string;
      contactLabel: string;
      doneButton: string;
      continueBrowsing: string;
      chatOnWhatsApp: string;
    };
    error: { default: string };
  };

  const [state, formAction, pending] = useActionState(
    submitProductRequestAction,
    undefined
  );
  const [values, setValues] = useState({
    customerName: "",
    contactNumber: "",
    quantity: "",
    message: "",
  });
  const successRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Set mounted after initial render to avoid hydration mismatch
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (state?.status === "success") {
      successRef.current?.focus();
    }
    if (!pending && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state?.status, pending]);

  function setValue(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    validateAll({ ...values, [field]: value });
  }

  function validateAll(data: typeof values): boolean {
    const result = productRequestSchema.safeParse({
      productSlug: product.slug,
      ...data,
    });
    if (!result.success) {
      const next: Partial<Record<keyof ProductRequestInput, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProductRequestInput | undefined;
        if (field && field !== "productSlug" && !next[field]) {
          next[field] = issue.message;
        }
      }
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  }

  const [errors, setErrors] = useState<Partial<Record<keyof ProductRequestInput, string>>>({});

  const nameError = getFieldError(state, "customerName") ?? errors.customerName;
  const contactError = getFieldError(state, "contactNumber") ?? errors.contactNumber;
  const quantityError = getFieldError(state, "quantity") ?? errors.quantity;
  const messageError = getFieldError(state, "message") ?? errors.message;

  if (state?.status === "success") {
    return (
      <section
        ref={successRef}
        tabIndex={-1}
        aria-labelledby="product-request-success-title"
        className="rounded-xl border border-border bg-card p-6 focus:outline-none sm:p-8"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="product-request-success-title"
              className="font-heading text-xl font-bold tracking-tight text-foreground"
            >
              {rq.success.thankYou.replace("{name}", values.customerName.trim() || "friend")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {rq.success.requestReady.replace("{product}", product.name)}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{rq.success.productLabel}</dt>
            <dd className="text-right font-medium text-foreground">
              {product.name}
              {product.model ? ` · ${product.model}` : ""}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{rq.success.quantityLabel}</dt>
            <dd className="text-right font-medium text-foreground">
              {values.quantity}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{rq.success.contactLabel}</dt>
            <dd className="text-right font-medium text-foreground">
              {values.contactNumber}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {onDone ? (
            <Button onClick={onDone} className="h-11 px-6">
              {rq.success.doneButton}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <ButtonLink href="/products" variant="primary">
              {rq.success.continueBrowsing}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          )}
          {whatsappHref && (
            <ButtonLink
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {rq.success.chatOnWhatsApp}
            </ButtonLink>
          )}
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

      {/* Selected product summary — always shown, never editable. */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            width={112}
            height={112}
            sizes="112px"
            className="size-16 flex-shrink-0 rounded-md object-cover sm:size-20"
          />
        ) : (
          <span className="flex size-16 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-navy via-navy-dark to-navy-dark text-gold/70 sm:size-20">
            <Package className="size-7" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {rq.productSummary.requestingPriceFor}
          </p>
          <h3 className="mt-0.5 truncate font-heading text-base font-semibold text-foreground">
            {product.name}
          </h3>
          {product.model ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{rq.productSummary.modelLabel}</span>{" "}
              {product.model}
            </p>
          ) : (
            product.categoryName && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {product.categoryName}
              </p>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pr-customerName">
            {rq.form.nameLabel} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pr-customerName"
            name="customerName"
            autoComplete="name"
            maxLength={200}
            placeholder={rq.form.namePlaceholder}
            value={values.customerName}
            onChange={(event) => setValue("customerName", event.target.value)}
            required
            aria-required="true"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "pr-customerName-error" : undefined}
          />
          <FieldError id="pr-customerName-error" error={nameError} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pr-contactNumber">
            {rq.form.contactLabel} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pr-contactNumber"
            name="contactNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder={rq.form.contactPlaceholder}
            value={values.contactNumber}
            onChange={(event) => setValue("contactNumber", event.target.value)}
            required
            aria-required="true"
            aria-invalid={contactError ? true : undefined}
            aria-describedby={
              contactError ? "pr-contactNumber-error" : "pr-contactNumber-hint"
            }
          />
          <p
            id="pr-contactNumber-hint"
            className={cn(contactError && "hidden", "text-xs text-muted-foreground")}
          >
            {rq.form.contactHint}
          </p>
          <FieldError id="pr-contactNumber-error" error={contactError} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-quantity">
          {rq.form.quantityLabel} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pr-quantity"
          name="quantity"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={9}
          pattern="[0-9]*"
          placeholder={rq.form.quantityPlaceholder}
          value={values.quantity}
          onChange={(event) => setValue("quantity", event.target.value)}
          required
          aria-required="true"
          aria-invalid={quantityError ? true : undefined}
          aria-describedby={quantityError ? "pr-quantity-error" : "pr-quantity-hint"}
        />
        <p
          id="pr-quantity-hint"
          className={cn(quantityError && "hidden", "text-xs text-muted-foreground")}
        >
          {rq.form.quantityHint}
        </p>
        <FieldError id="pr-quantity-error" error={quantityError} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-message">
          {rq.form.messageLabel} <span className="text-muted-foreground">{rq.form.messageOptional}</span>
        </Label>
        <Textarea
          id="pr-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder={rq.form.messagePlaceholder}
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "pr-message-error" : "pr-message-hint"}
        />
        <div className="flex items-center justify-between gap-4">
          <p
            id="pr-message-hint"
            className={cn(messageError && "hidden", "text-xs text-muted-foreground")}
          >
            {rq.form.messageHint}
          </p>
          <p className="text-right text-xs text-muted-foreground">
            {values.message.length}/2000
          </p>
        </div>
        <FieldError id="pr-message-error" error={messageError} />
      </div>

      <div>
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full px-7 text-base"
          aria-disabled={pending || undefined}
        >
          {pending ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              {rq.form.submittingButton}
            </>
          ) : (
            <>
              {rq.form.submitButton}
              <Send className="size-5" aria-hidden="true" />
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
          {rq.form.noObligation}
        </p>
      </div>
    </form>
  );
}