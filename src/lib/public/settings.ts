import "server-only";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { businessConfig } from "@/config/site";
import type { BusinessSettings as PrismaBusinessSettings } from "@/generated/prisma/client";

export interface PublicBusinessSettings {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  telegram: string | null;
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

function toPublicBusinessSettings(
  settings: PrismaBusinessSettings | null
): PublicBusinessSettings {
  const fallback = getFallbackSettings();
  if (!settings) return fallback;

  return {
    id: settings.id,
    name: settings.name,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    country: settings.country,
    facebook: settings.facebook,
    instagram: settings.instagram,
    tiktok: settings.tiktok,
    youtube: settings.youtube,
    telegram: settings.telegram,
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