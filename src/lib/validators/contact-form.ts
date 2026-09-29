import { z } from "zod";

export const CONTACT_FORM_NAME_MAX = 200;
export const CONTACT_FORM_CONTACT_MAX = 30;
export const CONTACT_FORM_MESSAGE_MAX = 2000;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Please enter your name.")
  .max(
    CONTACT_FORM_NAME_MAX,
    `Name can be at most ${CONTACT_FORM_NAME_MAX} characters.`
  );

const contactNumberSchema = z
  .string()
  .trim()
  .min(1, "Please enter your WhatsApp or phone number.")
  .max(
    CONTACT_FORM_CONTACT_MAX,
    "Contact number is too long."
  )
  .transform((value) => value.replace(/[\s\-().]/g, ""))
  .refine(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    "Please enter a valid number (digits, optional country code)."
  );

const productCategorySchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const messageSchema = z
  .string()
  .trim()
  .min(1, "Please enter a message.")
  .max(
    CONTACT_FORM_MESSAGE_MAX,
    `Message can be at most ${CONTACT_FORM_MESSAGE_MAX} characters.`
  );

export const contactFormSchema = z.object({
  customerName: nameSchema,
  contactNumber: contactNumberSchema,
  productCategory: productCategorySchema,
  message: messageSchema,
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;