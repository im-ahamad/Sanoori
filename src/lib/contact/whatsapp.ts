import type { PublicBusinessSettings } from "@/lib/public/settings";
import { isConfigPlaceholder } from "@/lib/config";

/**
 * WhatsApp deep-link helpers.
 *
 * This is a pure URL builder only — it does NOT call the WhatsApp API, send
 * messages, or expose any secret credentials. Safe to use from server and
 * client code. Returns `null` until the business config's WhatsApp number is
 * filled in (currently a "[WHATSAPP NUMBER]" placeholder).
 */

export const GENERAL_ENQUIRY_MESSAGE =
  "Hello Sanoori Trading, I want to know the prices of your products. Can you help me?";

/**
 * Builds a wa.me deep link for a given phone number and pre-filled message.
 * The number is normalised to its digit-only form; an empty result returns null.
 */
export function buildWhatsAppChatLink(
  number: string,
  message: string
): string | null {
  const digits = number.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppLink(
  settings: PublicBusinessSettings | { whatsapp: string | null },
  message: string
): string | null {
  const whatsapp = "whatsapp" in settings ? settings.whatsapp : null;
  if (!whatsapp || isConfigPlaceholder(whatsapp)) {
    return null;
  }

  return buildWhatsAppChatLink(whatsapp, message);
}

export interface WhatsAppProductLinkParams {
  productName: string;
  productId: string;
  /** Product Code / SKU when the product has one (e.g. "WC-427"). */
  productCode?: string | null;
  quantity: number;
  productUrl: string;
}

export interface WhatsAppProductLink {
  url: string;
  message: string;
}

export function createWhatsAppProductMessage({
  productName,
  productId,
  productCode,
  quantity,
  productUrl,
}: WhatsAppProductLinkParams): string {
  const lines = [
    "Hello Sanoori Trading,",
    "",
    "I want to know the price of this product.",
    "",
    `Product: ${productName}`,
  ];

  if (productCode) {
    lines.push(`Code: ${productCode}`);
  } else {
    lines.push(`Product ID: ${productId}`);
  }

  lines.push(`Quantity: ${quantity}`);
  lines.push("", "Product link:", productUrl);

  return lines.join("\n");
}

export function createWhatsAppProductLink(
  settings: PublicBusinessSettings | { whatsapp: string | null },
  params: WhatsAppProductLinkParams
): WhatsAppProductLink | null {
  const message = createWhatsAppProductMessage(params);
  const url = buildWhatsAppLink(settings, message);

  if (!url) {
    return null;
  }

  return { url, message };
}