import { z } from "zod";
import { Availability } from "@/generated/prisma";
import { isSafeSlug, normalizeSlug } from "@/lib/slug";

/**
 * Server-side validation for all product mutations (create + update).
 *
 * The client serializes structured fields as JSON text; these schemas parse
 * that input, validate shapes and limits, then produce clean values for the
 * database. Every mutation is re-validated here regardless of what the UI did.
 */

export interface KeyValueEntry {
  key: string;
  value: string;
}

export const availabilityValues = [
  Availability.IN_STOCK,
  Availability.ON_REQUEST,
  Availability.OUT_OF_STOCK,
] as const;

export const availabilityLabels: Record<string, string> = {
  IN_STOCK: "In stock",
  ON_REQUEST: "On request",
  OUT_OF_STOCK: "Out of stock",
};

const availabilitySchema = z.enum(availabilityValues);

function parseJsonField<T>(message: string, fallback: T) {
  return z
    .string()
    .transform((raw, ctx): T => {
      const text = raw.trim();
      if (text === "") return fallback;
      try {
        return JSON.parse(text) as T;
      } catch {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
    });
}

const featureListSchema = z
  .array(z.string().trim())
  .max(100, "Too many features (max 100)")
  .transform((list) =>
    list
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 100)
  );

const keyValueEntrySchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Every row needs a name")
    .max(100, "Row names can be at most 100 characters"),
  value: z
    .string()
    .trim()
    .max(500, "Values can be at most 500 characters"),
});

const keyValueListSchema = z
  .array(keyValueEntrySchema)
  .max(60, "Too many rows (max 60)");

const featuresField = parseJsonField<string[]>(
  "Feature list is invalid. Please refresh the page and try again.",
  []
).pipe(featureListSchema);

const specificationsField = parseJsonField<KeyValueEntry[]>(
  "Specifications are invalid. Please refresh the page and try again.",
  []
).pipe(keyValueListSchema);

const variantsField = parseJsonField<KeyValueEntry[]>(
  "Variants are invalid. Please refresh the page and try again.",
  []
).pipe(keyValueListSchema);

const slugField = z
  .string()
  .trim()
  .max(200, "Slug is too long")
  .transform((value) => normalizeSlug(value))
  .refine(
    (value) => value.length > 0 && isSafeSlug(value),
    "Slug can only contain lowercase letters, numbers and dashes"
  );

export const productFormSchema = z.object({
  productId: z.string().trim().max(100).optional().default(""),
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name is too long (max 200 characters)"),
  slug: slugField,
  productCode: z
    .string()
    .trim()
    .max(100, "Product code is too long")
    .transform((value) => (value === "" ? null : value)),
  categoryId: z
    .string()
    .trim()
    .min(1, "Select a category")
    .max(100, "Category value is invalid"),
  subcategoryId: z
    .string()
    .trim()
    .max(100, "Subcategory value is invalid")
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value))
    .default(null),
  shortDescription: z
    .string()
    .trim()
    .max(300, "Short description is too long (max 300 characters)")
    .transform((value) => (value === "" ? null : value)),
  description: z
    .string()
    .trim()
    .max(20_000, "Description is too long (max 20,000 characters)")
    .transform((value) => (value === "" ? null : value)),
  features: featuresField,
  specifications: specificationsField,
  variants: variantsField,
  availability: availabilitySchema,
  featured: z
    .string()
    .default("off")
    .transform((value) => value === "on"),
  isActive: z
    .string()
    .default("on")
    .transform((value) => value !== "off"),
  material: z
    .string()
    .trim()
    .max(200, "Material is too long (max 200 characters)")
    .transform((value) => (value === "" ? null : value))
    .optional()
    .default(""),
  size: z
    .string()
    .trim()
    .max(200, "Size is too long (max 200 characters)")
    .transform((value) => (value === "" ? null : value))
    .optional()
    .default(""),
  colorFinish: z
    .string()
    .trim()
    .max(200, "Color/Finish is too long (max 200 characters)")
    .transform((value) => (value === "" ? null : value))
    .optional()
    .default(""),
  showOnHome: z
    .string()
    .default("on")
    .transform((value) => value !== "off"),
  showOnProducts: z
    .string()
    .default("on")
    .transform((value) => value !== "off"),
});

/**
 * Raw values read from the form's FormData before it is shaped for storage.
 * Use `productFormSchema.safeParse()` to get a `ProductFormInput`.
 */
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productDeleteSchema = z.object({
  productId: z.string().trim().min(1).max(100),
});