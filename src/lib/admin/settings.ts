import "server-only";

import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

export type SettingsResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "database" };

export interface BusinessSettings {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
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

export async function getBusinessSettings(): Promise<SettingsResult<BusinessSettings>> {
  try {
    // These are stored in config, but we could also store in DB if needed
    // For now, return from config (handled client-side)
    return { ok: true, data: {} as BusinessSettings };
  } catch (error) {
    console.error("Failed to get business settings", error);
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

    if (!user) return { ok: false, error: "database" };

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