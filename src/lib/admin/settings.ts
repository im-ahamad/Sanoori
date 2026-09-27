import "server-only";

import { db } from "@/lib/db";
import { businessConfig } from "@/config/site";
import type { BusinessSettings as PrismaBusinessSettings } from "@/generated/prisma/client";

export type SettingsResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" | "not_found" };

export interface BusinessSettings {
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
  createdAt: Date;
  updatedAt: Date;
}

function toBusinessSettings(
  settings: PrismaBusinessSettings | null
): BusinessSettings | null {
  if (!settings) return null;
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
    createdAt: settings.createdAt ?? new Date(),
    updatedAt: settings.updatedAt ?? new Date(),
  };
}

export interface AdminProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

function getDefaultBusinessSettings(): BusinessSettings {
  return {
    id: "default",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getBusinessSettings(): Promise<SettingsResult<BusinessSettings>> {
  try {
    const settings = await db.businessSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!settings) {
      return { ok: true, data: getDefaultBusinessSettings() };
    }

    return { ok: true, data: toBusinessSettings(settings)! };
  } catch (error) {
    console.error("Failed to get business settings", error);
    return { ok: false, error: "database" };
  }
}

export async function getBusinessSettingsOrThrow(): Promise<BusinessSettings> {
  const result = await getBusinessSettings();
  if (!result.ok) {
    throw new Error("Failed to fetch business settings");
  }
  return result.data;
}

export async function createInitialBusinessSettings(): Promise<SettingsResult<BusinessSettings>> {
  try {
    const existing = await db.businessSettings.findFirst();
    if (existing) {
      return { ok: true, data: toBusinessSettings(existing)! };
    }

    const created = await db.businessSettings.create({
      data: {
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
      },
    });

    return { ok: true, data: toBusinessSettings(created)! };
  } catch (error) {
    console.error("Failed to create initial business settings", error);
    return { ok: false, error: "database" };
  }
}

export async function updateBusinessSettings(
  data: Partial<Omit<BusinessSettings, "id" | "createdAt" | "updatedAt">>
): Promise<SettingsResult<BusinessSettings>> {
  try {
    const existing = await db.businessSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!existing) {
      const created = await db.businessSettings.create({
        data: {
          name: data.name ?? businessConfig.name,
          phone: data.phone ?? businessConfig.phone,
          whatsapp: data.whatsapp ?? businessConfig.whatsapp,
          email: data.email ?? businessConfig.email,
          address: data.address ?? businessConfig.address,
          city: data.city ?? businessConfig.city,
          country: data.country ?? businessConfig.country,
          facebook: data.facebook ?? businessConfig.social.facebook,
          instagram: data.instagram ?? businessConfig.social.instagram,
          tiktok: data.tiktok ?? businessConfig.social.tiktok,
          youtube: data.youtube ?? businessConfig.social.youtube,
          telegram: data.telegram ?? businessConfig.social.telegram,
        },
      });
      return { ok: true, data: toBusinessSettings(created)! };
    }

    const updated = await db.businessSettings.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country,
        facebook: data.facebook,
        instagram: data.instagram,
        tiktok: data.tiktok,
        youtube: data.youtube,
        telegram: data.telegram,
      },
    });

    return { ok: true, data: toBusinessSettings(updated)! };
  } catch (error) {
    console.error("Failed to update business settings", error);
    return { ok: false, error: "database" };
  }
}

export async function getAdminProfile(userId: string): Promise<SettingsResult<AdminProfile>> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) return { ok: false, error: "not_found" };

    return {
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to get admin profile", error);
    return { ok: false, error: "database" };
  }
}