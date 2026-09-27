import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton for server-side code.
 *
 * Import this from Route Handlers, Server Actions, or server components via the
 * `@/lib/db` alias. NEVER import it from client components — access to the
 * database is server-only.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL ?? "";
  const url = new URL(connectionString);
  const database = url.pathname?.slice(1) || "sanoori_trading";
  
  const adapter = new PrismaPg({
    connectionString,
    database,
  });

  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}