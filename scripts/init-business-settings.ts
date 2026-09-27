#!/usr/bin/env node

/**
 * Initialize Business Settings from config
 *
 * This script creates the initial BusinessSettings record in the database
 * using the values from src/config/site.ts as defaults.
 *
 * Run with: npx tsx scripts/init-business-settings.ts
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { businessConfig } from "../src/config/site";

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
      console.log("Skipping initialization.");
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