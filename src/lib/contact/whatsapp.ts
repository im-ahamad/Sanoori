import { businessConfig } from "@/config/site";
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
  "Hello Sanoori Trading, I'm interested in your products. Could you please provide more information?";

export function buildWhatsAppLink(message: string): string | null {
  if (isConfigPlaceholder(businessConfig.whatsapp)) {
    return null;
  }

  const number = businessConfig.whatsapp.replace(/[^0-9]/g, "");

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppProductLinkParams {
  productName: string;
  productId: string;
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
  quantity,
  productUrl,
}: WhatsAppProductLinkParams): string {
  return [
    "Hello Sanoori Trading,",
    "",
    "I am interested in this product.",
    "",
    `Product: ${productName}`,
    `Product ID: ${productId}`,
    `Quantity: ${quantity}`,
    "",
    "Product Link:",
    productUrl,
  ].join("\n");
}

export function createWhatsAppProductLink(
  params: WhatsAppProductLinkParams
): WhatsAppProductLink | null {
  const message = createWhatsAppProductMessage(params);
  const url = buildWhatsAppLink(message);

  if (!url) {
    return null;
  }

  return { url, message };
}