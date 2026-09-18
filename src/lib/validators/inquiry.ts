import { z } from "zod";

/**
 * Validation strategy for future forms and API requests.
 *
 * These schemas are prepared for the inquiry flow (POST /api/inquiries and the
 * contact/quote forms). They protect against invalid product IDs, invalid
 * quantities, malformed email, invalid phone values, oversized messages, and
 * unexpected input.
 */

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^\+?[0-9][0-9\s().-]*$/, "Please enter a valid phone number");

export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(100_000, "Quantity is too large");

export const productIdSchema = z.string().trim().min(1).max(100);

export const messageSchema = z
  .string()
  .trim()
  .min(10, "Message should be at least 10 characters")
  .max(2_000, "Message is too long (max 2000 characters)");

export const emailSchema = z.union([z.literal(""), z.email()]);

export const inquirySourceSchema = z.enum([
  "WEBSITE",
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
  "TELEGRAM",
  "PHONE",
]);

export const inquirySchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(100),
  phone: phoneSchema,
  email: emailSchema.optional(),
  productId: productIdSchema.optional(),
  quantity: quantitySchema.optional(),
  message: messageSchema,
  source: inquirySourceSchema.default("WEBSITE"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;