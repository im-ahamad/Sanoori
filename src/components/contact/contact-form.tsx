"use client";

import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations, getTranslations } from "@/lib/i18n/use-translations";
import { submitContactFormAction } from "@/lib/actions/contact-form";

export function ContactForm() {
  const tContext = useTranslations();
  const [mounted, setMounted] = useState(false);
  const t = mounted ? tContext : getTranslations("en");
  const cp = t.contactPage;

  const [state, formAction, pending] = useActionState(
    submitContactFormAction,
    undefined
  );
  const [values, setValues] = useState({
    customerName: "",
    contactNumber: "",
    productCategory: "",
    message: "",
  });
  const successRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
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
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  if (state?.status === "success") {
    return (
      <section
        ref={successRef}
        tabIndex={-1}
        aria-labelledby="contact-success-title"
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 focus:outline-none"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="contact-success-title"
              className="font-heading text-lg font-bold tracking-tight text-foreground"
            >
              {cp.quickContact.successMessage}
            </h2>
          </div>
        </div>
      </section>
    );
  }

  const nameError = state?.fieldErrors?.customerName?.[0] ?? errors.customerName;
  const contactError = state?.fieldErrors?.contactNumber?.[0] ?? errors.contactNumber;
  const messageError = state?.fieldErrors?.message?.[0] ?? errors.message;

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state?.status === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="contact-name">
          {cp.quickContact.nameLabel} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contact-name"
          name="customerName"
          autoComplete="name"
          maxLength={CONTACT_FORM_NAME_MAX}
          placeholder={cp.quickContact.namePlaceholder}
          value={values.customerName}
          onChange={(event) => setValue("customerName", event.target.value)}
          required
          aria-required="true"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "contact-name-error" : undefined}
        />
        {nameError && (
          <p id="contact-name-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
            {nameError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-number">
          {cp.quickContact.contactLabel} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contact-number"
          name="contactNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={CONTACT_FORM_CONTACT_MAX}
          placeholder={cp.quickContact.contactPlaceholder}
          value={values.contactNumber}
          onChange={(event) => setValue("contactNumber", event.target.value)}
          required
          aria-required="true"
          aria-invalid={contactError ? true : undefined}
          aria-describedby={contactError ? "contact-number-error" : "contact-number-hint"}
        />
        <p
          id="contact-number-hint"
          className={cn(contactError && "hidden", "text-xs text-muted-foreground")}
        >
          {cp.quickContact.contactHint}
        </p>
        {contactError && (
          <p id="contact-number-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
            {contactError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-category">
          {cp.quickContact.productCategoryLabel}
        </Label>
        <Input
          id="contact-category"
          name="productCategory"
          placeholder={cp.quickContact.productCategoryPlaceholder}
          value={values.productCategory}
          onChange={(event) => setValue("productCategory", event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">
          {cp.quickContact.messageLabel} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={4}
          maxLength={CONTACT_FORM_MESSAGE_MAX}
          placeholder={cp.quickContact.messagePlaceholder}
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          required
          aria-required="true"
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "contact-message-error" : undefined}
        />
        {messageError && (
          <p id="contact-message-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">
            {messageError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto h-12 px-7 text-base"
        aria-disabled={pending || undefined}
      >
        {pending ? (
          <>
            <Loader2 className="size-5 animate-spin mr-2" aria-hidden="true" />
            {cp.quickContact.submittingButton}
          </>
        ) : (
          <>
            {cp.quickContact.submitButton}
            <Send className="size-5 ml-2" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}

const CONTACT_FORM_NAME_MAX = 200;
const CONTACT_FORM_CONTACT_MAX = 30;
const CONTACT_FORM_MESSAGE_MAX = 2000;