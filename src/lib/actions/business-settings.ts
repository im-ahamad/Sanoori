"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateBusinessSettings, getBusinessSettings } from "@/lib/admin/settings";
import type { BusinessSettings } from "@/lib/admin/settings";

export type UpdateBusinessSettingsResult =
  | { ok: true; message: string }
  | { ok: false; message: string; issues?: z.ZodIssue[] };

const urlOrEmptySchema = z.string().url().or(z.literal("")).optional().nullable();

const updateBusinessSettingsSchema = z.object({
  name: z.string().min(1, "Business name is required").max(100),
  phone: z.string().max(50).optional().nullable(),
  whatsapp: z.string().max(50).optional().nullable(),
  email: z.string().email("Invalid email address").max(100).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  facebook: urlOrEmptySchema,
  instagram: urlOrEmptySchema,
  tiktok: urlOrEmptySchema,
  youtube: urlOrEmptySchema,
  telegram: urlOrEmptySchema,
});

export async function updateBusinessSettingsAction(
  _prevState: UpdateBusinessSettingsResult | undefined,
  formData: FormData
): Promise<UpdateBusinessSettingsResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, message: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    facebook: formData.get("facebook") || undefined,
    instagram: formData.get("instagram") || undefined,
    tiktok: formData.get("tiktok") || undefined,
    youtube: formData.get("youtube") || undefined,
    telegram: formData.get("telegram") || undefined,
  };

  const parsed = updateBusinessSettingsSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((e) => e.message).join("; "),
      issues: parsed.error.issues,
    };
  }

  try {
    const result = await updateBusinessSettings(parsed.data);

    if (!result.ok) {
      return { ok: false, message: "Failed to update business settings" };
    }

    return { ok: true, message: "Business settings updated successfully" };
  } catch (error) {
    console.error("Failed to update business settings", error);
    return { ok: false, message: "Something went wrong while updating settings" };
  }
}

export async function getBusinessSettingsAction(): Promise<
  | { ok: true; data: BusinessSettings }
  | { ok: false; message: string }
> {
  try {
    const result = await getBusinessSettings();
    if (!result.ok) {
      return { ok: false, message: "Failed to fetch business settings" };
    }
    return { ok: true, data: result.data };
  } catch (error) {
    console.error("Failed to get business settings", error);
    return { ok: false, message: "Failed to fetch business settings" };
  }
}