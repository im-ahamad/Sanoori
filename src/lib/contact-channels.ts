import { isConfigPlaceholder } from "@/lib/config";
import type { PublicBusinessSettings } from "@/lib/public/settings";

/**
 * Centralized contact channel registry.
 *
 * Product pages and BUY/NOW flows should derive their contact options from this
 * module instead of hard-coding WhatsApp/Facebook/Instagram/Telegram URLs inside
 * individual components. All values resolve from `businessConfig`; anything left
 * as a "[PLACEHOLDER]" is excluded until the business fills it in.
 */

export const CONTACT_CHANNEL_IDS = [
  "whatsapp",
  "facebook",
  "instagram",
  "telegram",
  "phone",
] as const;

export type ContactChannelId = (typeof CONTACT_CHANNEL_IDS)[number];

export interface ContactChannel {
  id: ContactChannelId;
  label: string;
  href: string;
  isConfigured: boolean;
}

function resolveChannelHref(settings: PublicBusinessSettings, id: ContactChannelId): string {
  switch (id) {
    case "whatsapp": {
      const digits = (settings.whatsapp || "").replace(/[^0-9]/g, "");
      return `https://wa.me/${digits}`;
    }
    case "facebook":
      return settings.facebook || "";
    case "instagram":
      return settings.instagram || "";
    case "telegram":
      return settings.telegram || "";
    case "phone":
      return `tel:${settings.phone || ""}`;
  }
}

function resolveRawValue(settings: PublicBusinessSettings, id: ContactChannelId): string {
  switch (id) {
    case "whatsapp":
      return settings.whatsapp || "";
    case "facebook":
      return settings.facebook || "";
    case "instagram":
      return settings.instagram || "";
    case "telegram":
      return settings.telegram || "";
    case "phone":
      return settings.phone || "";
  }
}

export function getContactChannels(settings: PublicBusinessSettings): ContactChannel[] {
  return CONTACT_CHANNEL_IDS.map((id) => {
    const raw = resolveRawValue(settings, id);
    return {
      id,
      label: id,
      href: resolveChannelHref(settings, id),
      isConfigured: !isConfigPlaceholder(raw),
    };
  });
}

export function getContactChannel(settings: PublicBusinessSettings, id: ContactChannelId): ContactChannel | undefined {
  return getContactChannels(settings).find((channel) => channel.id === id);
}

export function getConfiguredContactChannels(settings: PublicBusinessSettings): ContactChannel[] {
  return getContactChannels(settings).filter((channel) => channel.isConfigured);
}