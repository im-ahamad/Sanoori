import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Create or reset the admin account used by the /admin area.
 *
 * Usage:
 *   npm run db:create-admin -- --email admin@example.com --password 'a-strong-password' [--name 'Manager']
 *
 * The password is hashed with bcrypt before it is stored. Plain-text passwords
 * are never persisted or printed.
 * 
 */

const BCRYPT_ROUNDS = 10;

function parseArgs(argv: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value !== undefined && !value.startsWith("--")) {
        result[key] = value;
        i++;
      }
    }
  }
  return result;
}

const argSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(200, "Password is too long"),
  name: z.string().trim().max(100).optional(),
});

async function main() {
  const parsed = argSchema.safeParse(parseArgs(process.argv.slice(2)));

  if (!parsed.success) {
    console.error("Usage: npm run db:create-admin -- --email <email> --password <password> [--name <name>]");
    console.error(parsed.error.issues[0]?.message);
    process.exitCode = 1;
    return;
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log("Admin account ready:");
  console.log(`  email: ${user.email}`);
  if (user.name) console.log(`  name:  ${user.name}`);
  console.log(`  role:  ${user.role}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Failed to create admin account:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});