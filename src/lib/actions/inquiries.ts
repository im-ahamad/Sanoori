"use server";

import { db } from "@/lib/db";
import { inquiryFormSchema } from "@/lib/validators/inquiry";

/**
 * Handles public inquiry (request-a-quote) submissions.
 *
 * The result shape is shared with the client form:
 *   - `success`: the inquiry was stored (or knowingly discarded when the
 *     honeypot tripped — we never acknowledge bots).
 *   - `error`: a friendly message plus optional per-field errors.
 *
 * Source and status are deliberately NOT accepted from the client; every
 * submission is recorded as `WEBSITE` and starts as `NEW`. Product selection
 * arrives as a slug and is resolved server-side against active products only.
 */

export type InquiryActionState =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

/**
 * Ensure every expected field exists (as an empty string) before validation.
 * Bots or non-browser clients can omit optional form fields; zod needs the
 * key present to validate the union schemas correctly.
 */
function normalizeFormData(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = typeof value === "string" ? value : "";
  }
  for (const key of [
    "customerName",
    "phone",
    "email",
    "productSlug",
    "quantity",
    "message",
    "company",
  ]) {
    if (typeof out[key] !== "string") out[key] = "";
  }
  return out;
}

export async function submitInquiryAction(
  _prevState: InquiryActionState,
  formData: FormData
): Promise<InquiryActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inquiryFormSchema.safeParse(normalizeFormData(raw));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  // Honeypot entered? Pretend success but never persist bot submissions.
  if (input.company) {
    return {
      status: "success",
      message: "Your inquiry has been received.",
    };
  }

  let productId: string | null = null;

  try {
    if (input.productSlug) {
      const product = await db.product.findFirst({
        where: { slug: input.productSlug, isActive: true },
        select: { id: true },
      });

      if (!product) {
        return {
          status: "error",
          message: "Please fix the highlighted fields and try again.",
          fieldErrors: {
            productSlug: [
              "This product is no longer available. Choose another one or leave it blank.",
            ],
          },
        };
      }

      productId = product.id;
    }

    await db.inquiry.create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        productId,
        quantity: input.quantity,
        message: input.message,
        source: "WEBSITE",
      },
    });
  } catch (error) {
    console.error("Failed to save inquiry", error);
    return {
      status: "error",
      message:
        "Something went wrong and we could not save your request. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "Your inquiry has been received.",
  };
}