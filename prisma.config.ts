import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config();

/**
 * Prisma 7.10.0 TypeScript types for `Datasource` only include `url` and `shadowDatabaseUrl`.
 * The Prisma CLI accepts `directUrl` for migration commands (verified via `prisma validate`).
 * Cast the config to satisfy the type checker while allowing the extra property.
 */
const prismaConfig = {
  schema: "./prisma/schema.prisma",
  datasource: {
    // Use DIRECT_URL (Neon) for migrations; DATABASE_URL (local) for app runtime via @prisma/adapter-pg
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
} as const;

export default defineConfig(prismaConfig);