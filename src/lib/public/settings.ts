import "server-only";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { businessConfig } from "@/config/site";
import { isConfigPlaceholder } from "@/lib/config";
import type { BusinessSettings as PrismaBusinessSettings } from "@/generated/prisma/client";

export interface PublicBusinessSettings {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  telegram: string;
  logo: {
    src: string;
    alt: string;
  };
  maps: {
    googleMapsEmbed: string;
    googleMapsLink: string;
  };
  analytics: {
    gaMeasurementId: string;
  };
}

function resolveValue(stored: string | null, configured: string): string {
  if (stored === null || isConfigPlaceholder(stored)) {
    return configured;
  }
  return stored;
}

function toPublicBusinessSettings(
  settings: PrismaBusinessSettings | null
): PublicBusinessSettings {
  const fallback = getFallbackSettings();
  if (!settings) return fallback;

  return {
    id: settings.id,
    name: settings.name,
    phone: resolveValue(settings.phone, fallback.phone),
    whatsapp: resolveValue(settings.whatsapp, fallback.whatsapp),
    email: resolveValue(settings.email, fallback.email),
    address: resolveValue(settings.address, fallback.address),
    city: resolveValue(settings.city, fallback.city),
    country: resolveValue(settings.country, fallback.country),
    facebook: resolveValue(settings.facebook, fallback.facebook),
    instagram: resolveValue(settings.instagram, fallback.instagram),
    tiktok: resolveValue(settings.tiktok, fallback.tiktok),
    youtube: resolveValue(settings.youtube, fallback.youtube),
    telegram: resolveValue(settings.telegram, fallback.telegram),
    logo: fallback.logo,
    maps: fallback.maps,
    analytics: fallback.analytics,
  };
}

function getFallbackSettings(): PublicBusinessSettings {
  return {
    id: "fallback",
    name: businessConfig.name,
    phone: businessConfig.phone,
    whatsapp: businessConfig.whatsapp,
    email: businessConfig.email,
    address: businessConfig.address,
    city: businessConfig.city,
    country: businessConfig.country,
    facebook: businessConfig.social.facebook,
    instagram: businessConfig.social.instagram,
    tiktok: businessConfig.social.tiktok,
    youtube: businessConfig.social.youtube,
    telegram: businessConfig.social.telegram,
    logo: businessConfig.logo,
    maps: businessConfig.maps,
    analytics: businessConfig.analytics,
  };
}

export const getPublicBusinessSettings = unstable_cache(
  async (): Promise<PublicBusinessSettings> => {
    try {
      const settings = await db.businessSettings.findFirst({
        orderBy: { createdAt: "asc" },
      });
      return toPublicBusinessSettings(settings);
    } catch (error) {
      console.error("Failed to fetch business settings, using fallback", error);
      return getFallbackSettings();
    }
  },
  ["public-business-settings"],
  { tags: ["business-settings"], revalidate: 60 }
);