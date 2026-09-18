import { businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";

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

function resolveChannelHref(id: ContactChannelId): string {
  switch (id) {
    case "whatsapp": {
      const digits = businessConfig.whatsapp.replace(/[^0-9]/g, "");
      return `https://wa.me/${digits}`;
    }
    case "facebook":
      return businessConfig.social.facebook;
    case "instagram":
      return businessConfig.social.instagram;
    case "telegram":
      return businessConfig.social.telegram;
    case "phone":
      return `tel:${businessConfig.phone}`;
  }
}

function resolveRawValue(id: ContactChannelId): string {
  switch (id) {
    case "whatsapp":
      return businessConfig.whatsapp;
    case "facebook":
      return businessConfig.social.facebook;
    case "instagram":
      return businessConfig.social.instagram;
    case "telegram":
      return businessConfig.social.telegram;
    case "phone":
      return businessConfig.phone;
  }
}

const CHANNEL_LABELS: Record<ContactChannelId, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook Messenger",
  instagram: "Instagram",
  telegram: "Telegram",
  phone: "Call",
};

export function getContactChannels(): ContactChannel[] {
  return CONTACT_CHANNEL_IDS.map((id) => {
    const raw = resolveRawValue(id);
    return {
      id,
      label: CHANNEL_LABELS[id],
      href: resolveChannelHref(id),
      isConfigured: !isConfigPlaceholder(raw),
    };
  });
}

export function getContactChannel(id: ContactChannelId): ContactChannel | undefined {
  return getContactChannels().find((channel) => channel.id === id);
}

export function getConfiguredContactChannels(): ContactChannel[] {
  return getContactChannels().filter((channel) => channel.isConfigured);
}