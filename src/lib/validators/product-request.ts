import { z } from "zod";

/**
 * Client-side validation for the product "Ask for Price" request.
 *
 * Frontend only for now: the same friendly rules power the inline validation
 * shown to the customer. The backend is not built yet, so this does not touch
 * the server or the database.
 */

export const PRODUCT_REQUEST_NAME_MAX = 200;
export const PRODUCT_REQUEST_CONTACT_MAX = 30;
export const PRODUCT_REQUEST_QUANTITY_MAX = 100_000;
export const PRODUCT_REQUEST_MESSAGE_MAX = 2000;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Please enter your name.")
  .max(
    PRODUCT_REQUEST_NAME_MAX,
    `Name can be at most ${PRODUCT_REQUEST_NAME_MAX} characters.`
  );

/**
 * One WhatsApp or IMO number field. Accepts digits with an optional leading
 * "+" after normalizing spaces, dashes, dots and parentheses. 7–15 digits per
 * the E.164 range so both Bangladesh and international numbers work.
 */
const contactNumberSchema = z
  .string()
  .trim()
  .min(1, "Please enter your WhatsApp or IMO number.")
  .max(
    PRODUCT_REQUEST_CONTACT_MAX,
    "Contact number is too long."
  )
  .transform((value) => value.replace(/[\s\-().]/g, ""))
  .refine(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    "Please enter a valid number (digits, optional country code)."
  );

const quantitySchema = z
  .string()
  .trim()
  .min(1, "Please enter the quantity you need.")
  .refine(
    (value) =>
      /^\d{1,9}$/.test(value) &&
      Number(value) >= 1 &&
      Number(value) <= PRODUCT_REQUEST_QUANTITY_MAX,
    {
      message: `Quantity must be a whole number between 1 and ${PRODUCT_REQUEST_QUANTITY_MAX.toLocaleString()}.`,
    }
  );

const messageSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .max(
        PRODUCT_REQUEST_MESSAGE_MAX,
        `Message can be at most ${PRODUCT_REQUEST_MESSAGE_MAX} characters.`
      ),
  ])
  .transform((value) => (value === "" ? "" : value));

export const productRequestSchema = z.object({
  productSlug: z
    .string()
    .trim()
    .min(1, "Please select a product to request a price for."),
  customerName: nameSchema,
  contactNumber: contactNumberSchema,
  quantity: quantitySchema,
  message: messageSchema,
});

export type ProductRequestInput = z.infer<typeof productRequestSchema>;