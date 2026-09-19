import { z } from "zod";

/**
 * Public inquiry (request-a-quote) validation.
 *
 * The browser form is a convenience layer only — every inquiry is re-validated
 * here on the server before it reaches the database. Source and status are NOT
 * accepted from the client: the action always stores `source = WEBSITE` and the
 * inquiry starts as `NEW`. Clients may choose a product by slug only; the
 * server resolves that slug to a real, active product record.
 */

export const INQUIRY_NAME_MAX = 200;
export const INQUIRY_PHONE_MAX = 30;
export const INQUIRY_EMAIL_MAX = 200;
export const INQUIRY_PRODUCT_SLUG_MAX = 200;
export const INQUIRY_QUANTITY_MAX = 100_000;
export const INQUIRY_MESSAGE_MAX = 2000;
export const HONEYPOT_MAX = 400;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Please enter your name.")
  .max(
    INQUIRY_NAME_MAX,
    `Name can be at most ${INQUIRY_NAME_MAX} characters.`
  );

/**
 * Phone accepts digits with optional leading "+" after normalizing spaces,
 * dashes, dots and parentheses. It tolerates Bangladesh formats (with or
 * without +880) and other international numbers without one overly strict
 * regex. 7–15 digits per the E.164 range.
 */
const phoneSchema = z
  .string()
  .trim()
  .min(1, "Please enter your phone number.")
  .max(INQUIRY_PHONE_MAX, "Phone number is too long.")
  .transform((value) => value.replace(/[\s\-().]/g, ""))
  .refine(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    "Please enter a valid phone number (digits, optional country code)."
  );

const emailSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .max(INQUIRY_EMAIL_MAX, "Email is too long.")
      .email("Please enter a valid email address."),
  ])
  .transform((value) => (value === "" ? null : value.toLowerCase()));

const productSlugSchema = z
  .string()
  .trim()
  .max(INQUIRY_PRODUCT_SLUG_MAX, "Product reference is invalid.")
  .optional()
  .default("")
  .transform((value) => (value === "" ? null : value));

const quantitySchema = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(
    (value) =>
      value === "" ||
      (/^\d{1,9}$/.test(value) &&
        Number(value) >= 1 &&
        Number(value) <= INQUIRY_QUANTITY_MAX),
    {
      message: `Quantity must be a whole number between 1 and ${INQUIRY_QUANTITY_MAX.toLocaleString()}.`,
    }
  )
  .transform((value) => (value === "" ? null : Number(value)));

const messageSchema = z
  .string()
  .trim()
  .min(1, "Please tell us a little about what you need.")
  .max(
    INQUIRY_MESSAGE_MAX,
    `Message can be at most ${INQUIRY_MESSAGE_MAX} characters.`
  );

export const inquiryFormSchema = z.object({
  customerName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  productSlug: productSlugSchema,
  quantity: quantitySchema,
  message: messageSchema,
  /** Honeypot — never stored, never accepted. */
  company: z.string().max(HONEYPOT_MAX).default(""),
});

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;