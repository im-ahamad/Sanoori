"use server";

import { db } from "@/lib/db";
import { productRequestSchema } from "@/lib/validators/product-request";

export type ProductRequestActionState =
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
  for (const key of ["productSlug", "customerName", "contactNumber", "quantity", "message"]) {
    if (typeof out[key] !== "string") out[key] = "";
  }
  return out;
}

export async function submitProductRequestAction(
  _prevState: ProductRequestActionState,
  formData: FormData
): Promise<ProductRequestActionState> {
  const raw = Object.fromEntries(formData.entries());
  const normalized = normalizeFormData(raw);
  const parsed = productRequestSchema.safeParse(normalized);
  if (!parsed.success) {
    console.error("[ProductRequest] Validation failed:", parsed.error.flatten().fieldErrors);
  }

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  let productId: string | null = null;

  try {
    const product = await db.product.findFirst({
      where: { slug: input.productSlug, isActive: true },
      select: { id: true },
    });

    if (!product) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: {
          productSlug: ["This product is no longer available."],
        },
      };
    }

    productId = product.id;

    await db.inquiry.create({
      data: {
        customerName: input.customerName,
        phone: input.contactNumber,
        email: null,
        productId,
        quantity: Number(input.quantity),
        message: input.message,
        source: "WEBSITE",
        status: "NEW",
      },
    });
  } catch (error) {
    console.error("Failed to save product request", error);
    return {
      status: "error",
      message: "Something went wrong and we could not save your request. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "Your price request has been received.",
  };
}