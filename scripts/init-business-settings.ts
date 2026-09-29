#!/usr/bin/env node

/**
 * Initialize / repair Business Settings from config
 *
 * Creates the initial BusinessSettings record from src/config/site.ts when none
 * exists, and repairs an existing record whose fields still hold seeded
 * `[PLACEHOLDER]` tokens.
 *
 * The repair is deliberately conservative and idempotent: it only rewrites
 * fields that are still placeholders, leaves real values (e.g. a country
 * already filled in through the admin UI) untouched, and never creates a second
 * row.
 *
 * Run with: npx tsx scripts/init-business-settings.ts
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { businessConfig } from "../src/config/site";
import { isConfigPlaceholder } from "../src/lib/config";

type SettingsField =
  | "name"
  | "phone"
  | "whatsapp"
  | "email"
  | "address"
  | "city"
  | "country"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "telegram";

/** The only source of truth for the values written into the database. */
const CONFIGURED_VALUES: Record<SettingsField, string> = {
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
};

function parseDatabaseName(connectionString: string): string | undefined {
  try {
    const url = new URL(connectionString);
    const pathname = url.pathname;
    if (pathname && pathname.length > 1) {
      return pathname.slice(1);
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined;
}

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const database = parseDatabaseName(connectionString);

  const adapter = new PrismaPg({
    connectionString,
    ...(database && { database }),
  });

  const db = new PrismaClient({ adapter });

  try {
    console.log("Checking for existing BusinessSettings...");

    const existing = await db.businessSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (existing) {
      console.log("BusinessSettings already exists:", existing.id);

      const current: Record<SettingsField, string | null> = {
        name: existing.name,
        phone: existing.phone,
        whatsapp: existing.whatsapp,
        email: existing.email,
        address: existing.address,
        city: existing.city,
        country: existing.country,
        facebook: existing.facebook,
        instagram: existing.instagram,
        tiktok: existing.tiktok,
        youtube: existing.youtube,
        telegram: existing.telegram,
      };

      // Only fields still holding a placeholder (or nothing at all) are
      // eligible, and only when the configured value actually differs — so a
      // field that is already "unset" in both places is not rewritten. Anything
      // already filled in is left exactly as it is.
      const changes: Partial<Record<SettingsField, string>> = {};
      for (const field of Object.keys(CONFIGURED_VALUES) as SettingsField[]) {
        if (
          isConfigPlaceholder(current[field]) &&
          current[field] !== CONFIGURED_VALUES[field]
        ) {
          changes[field] = CONFIGURED_VALUES[field];
        }
      }

      const changedFields = Object.keys(changes) as SettingsField[];

      if (changedFields.length === 0) {
        console.log("No placeholder values found. Nothing to repair.");
        return;
      }

      console.log(`Repairing ${changedFields.length} placeholder field(s)...`);
      for (const field of changedFields) {
        console.log(`  - ${field}: ${current[field] ?? "(empty)"} -> ${changes[field]}`);
      }

      const repaired = await db.businessSettings.update({
        where: { id: existing.id },
        data: changes,
      });

      console.log("✅ BusinessSettings repaired successfully!");
      console.log("ID:", repaired.id);
      for (const field of Object.keys(CONFIGURED_VALUES) as SettingsField[]) {
        console.log(`${field}:`, repaired[field] ?? "(empty)");
      }
      return;
    }

    console.log("Creating initial BusinessSettings from config...");

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

    console.log("✅ BusinessSettings created successfully!");
    console.log("ID:", created.id);
    console.log("Name:", created.name);
    console.log("Phone:", created.phone);
    console.log("WhatsApp:", created.whatsapp);
    console.log("Email:", created.email);
    console.log("Address:", created.address);
    console.log("City:", created.city);
    console.log("Country:", created.country);
    console.log("Facebook:", created.facebook);
    console.log("Instagram:", created.instagram);
    console.log("TikTok:", created.tiktok);
    console.log("YouTube:", created.youtube);
    console.log("Telegram:", created.telegram);
  } catch (error) {
    console.error("❌ Failed to initialize BusinessSettings:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();