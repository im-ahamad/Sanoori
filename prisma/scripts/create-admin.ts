#!/usr/bin/env node

/**
 * Create or reset an admin account.
 *
 * The admin login (Auth.js Credentials provider) only accepts an existing,
 * active ADMIN row with a matching bcrypt hash — there is no "forgot password"
 * flow, so this script is the supported recovery path.
 *
 * Usage:
 *   npm run db:create-admin -- --email admin@example.com --password 'your-password' [--name 'Name']
 *   npm run db:create-admin -- --list
 *
 * Flags:
 *   --email <email>     account to create or reset (required unless --list)
 *   --password <p>      new password, min 8 chars (or set SANOORI_ADMIN_PASSWORD)
 *   --name <name>       display name, only applied when creating
 *   --activate          re-enable a deactivated account
 *   --list              print every account (never prints hashes or passwords)
 *   --help              show this help
 *
 * Plain text is never stored: passwords are bcrypt-hashed (cost 12) and never
 * printed. Prefer SANOORI_ADMIN_PASSWORD over --password so the secret does not
 * end up in your shell history.
 */

import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Options {
  email?: string;
  password?: string;
  name?: string;
  activate: boolean;
  list: boolean;
  help: boolean;
}

class UsageError extends Error {}

const USAGE = `Create or reset an admin account.

  npm run db:create-admin -- --email <email> --password <password> [--name <Name>] [--activate]
  npm run db:create-admin -- --list
  npm run db:create-admin -- --help

  --email <email>   account to create or reset
  --password <p>    new password (min ${MIN_PASSWORD_LENGTH} chars); SANOORI_ADMIN_PASSWORD also works
  --name <name>     display name, applied when the account is created
  --activate        re-enable a deactivated account (login is blocked otherwise)
  --list            list accounts without touching anything
  --help            show this help

Passwords are bcrypt-hashed and never printed.`;

function parseArgs(argv: string[]): Options {
  const options: Options = { activate: false, list: false, help: false };

  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith("--")) {
      throw new UsageError(`Unexpected argument: ${raw}`);
    }

    const eq = raw.indexOf("=");
    const key = eq === -1 ? raw : raw.slice(0, eq);
    const inline = eq === -1 ? undefined : raw.slice(eq + 1);

    const takeValue = (): string => {
      if (inline !== undefined) return inline;
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        throw new UsageError(`Missing value for ${key}`);
      }
      i += 1;
      return next;
    };

    switch (key) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--list":
        options.list = true;
        break;
      case "--activate":
        options.activate = true;
        break;
      case "--email":
        options.email = takeValue();
        break;
      case "--password":
        options.password = takeValue();
        break;
      case "--name":
        options.name = takeValue();
        break;
      default:
        throw new UsageError(`Unknown option: ${key}`);
    }
  }

  return options;
}

function requireDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at your database."
    );
  }
  try {
    new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid connection string.");
  }
  return connectionString;
}

function createClient(connectionString: string): PrismaClient {
  const database = new URL(connectionString).pathname.replace(/^\//, "");
  const adapter = new PrismaPg({
    connectionString,
    ...(database && { database }),
  });
  return new PrismaClient({ adapter });
}

function normalizedEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 200) {
    throw new UsageError(`Not a valid email address: ${value}`);
  }
  return email;
}

function resolvePassword(options: Options): string {
  const password = options.password ?? process.env.SANOORI_ADMIN_PASSWORD ?? "";
  if (!password) {
    throw new UsageError(
      "Missing --password (or SANOORI_ADMIN_PASSWORD). Passwords are never printed."
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new UsageError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new UsageError(
      `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`
    );
  }
  return password;
}

async function listAccounts(db: PrismaClient): Promise<void> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log("No admin accounts exist yet.");
    return;
  }

  console.log(`Admin accounts (${users.length}):`);
  for (const user of users) {
    const status = user.isActive ? "active" : "INACTIVE";
    console.log(
      `  - ${user.email}  role=${user.role}  ${status}  name=${user.name ?? "(none)"}`
    );
  }
}

async function createOrUpdateAdmin(
  db: PrismaClient,
  options: Options
): Promise<void> {
  const email = normalizedEmail(options.email ?? "");
  const passwordHash = await bcrypt.hash(
    resolvePassword(options),
    BCRYPT_ROUNDS
  );

  const existing = await db.user.findUnique({ where: { email } });

  if (!existing) {
    const created = await db.user.create({
      data: {
        email,
        passwordHash,
        name: options.name,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log(`Created admin ${created.email} (id ${created.id}).`);
    return;
  }

  const changes: { passwordHash: string; name?: string; isActive?: boolean } = {
    passwordHash,
  };
  if (options.name !== undefined) changes.name = options.name;
  if (options.activate) changes.isActive = true;

  const updated = await db.user.update({
    where: { id: existing.id },
    data: changes,
  });

  console.log(`Reset password for ${updated.email} (id ${updated.id}).`);
  if (existing.name !== updated.name) {
    console.log(
      `  name: ${existing.name ?? "(none)"} -> ${updated.name ?? "(none)"}`
    );
  }
  if (!existing.isActive && !updated.isActive) {
    console.log(
      "  status: INACTIVE — login stays blocked; re-run with --activate to re-enable."
    );
  } else if (!existing.isActive && updated.isActive) {
    console.log("  status: inactive -> active");
  } else {
    console.log("  status: active");
  }
  if (existing.role !== "ADMIN") {
    console.log(
      `  note: role is ${existing.role}; create-admin does not change roles.`
    );
  }
}

function printUsageError(message: string): void {
  console.error(`${message}\n\n${USAGE}`);
  process.exitCode = 1;
}

async function main(): Promise<void> {
  let options: Options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    printUsageError(error instanceof Error ? error.message : String(error));
    return;
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  if (!options.list) {
    if (!options.email) {
      printUsageError("Missing --email.");
      return;
    }
    if (!EMAIL_PATTERN.test(options.email.trim())) {
      printUsageError(`Not a valid email address: ${options.email}`);
      return;
    }
    if (!options.password && !process.env.SANOORI_ADMIN_PASSWORD) {
      printUsageError(
        "Missing --password (or SANOORI_ADMIN_PASSWORD). Passwords are never printed."
      );
      return;
    }
  }

  let db: PrismaClient;
  try {
    db = createClient(requireDatabaseUrl());
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    return;
  }

  try {
    if (options.list) {
      await listAccounts(db);
      return;
    }
    await createOrUpdateAdmin(db, options);
  } catch (error) {
    if (error instanceof UsageError) {
      printUsageError(error.message);
      return;
    }
    console.error("Failed to create admin:", error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error("Unexpected failure:", error);
  process.exitCode = 1;
});
