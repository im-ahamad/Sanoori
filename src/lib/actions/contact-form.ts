"use server";

import { db } from "@/lib/db";
import { contactFormSchema } from "@/lib/validators/contact-form";

export type ContactFormActionState =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

function normalizeFormData(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = typeof value === "string" ? value : "";
  }
  for (const key of ["customerName", "contactNumber", "productCategory", "message"]) {
    if (typeof out[key] !== "string") out[key] = "";
  }
  return out;
}

export async function submitContactFormAction(
  _prevState: ContactFormActionState,
  formData: FormData
): Promise<ContactFormActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactFormSchema.safeParse(normalizeFormData(raw));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    await db.inquiry.create({
      data: {
        customerName: input.customerName,
        phone: input.contactNumber,
        email: null,
        productId: null,
        quantity: null,
        message: input.message,
        source: "WEBSITE",
        status: "NEW",
      },
    });
  } catch (error) {
    console.error("Failed to save contact form", error);
    return {
      status: "error",
      message: "Something went wrong and we could not save your message. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "Your message has been sent. We will get back to you soon.",
  };
}