import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? "";
const url = new URL(connectionString);
const database = url.pathname?.slice(1) || "sanoori_trading";

const adapter = new PrismaPg({
  connectionString,
  database,
});

const db = new PrismaClient({ adapter });

async function main() {
  const email = "sanoori.trading@gmail.com";

  const existing = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      emailVerified: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!existing) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }

  console.log("Before migration:");
  console.log(JSON.stringify(existing, null, 2));

  if (existing.role === "SUPER_ADMIN") {
    console.log("User is already SUPER_ADMIN. No change needed.");
    return;
  }

  const updated = await db.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      emailVerified: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("\nAfter migration:");
  console.log(JSON.stringify(updated, null, 2));

  const passwordUnchanged = updated.passwordHash === existing.passwordHash;
  const idUnchanged = updated.id === existing.id;
  const emailUnchanged = updated.email === existing.email;
  const isActiveUnchanged = updated.isActive === existing.isActive;
  const emailVerifiedUnchanged = updated.emailVerified === existing.emailVerified;
  const createdAtUnchanged = updated.createdAt.getTime() === existing.createdAt.getTime();

  console.log("\nVerification:");
  console.log(`  User ID unchanged: ${idUnchanged}`);
  console.log(`  Email unchanged: ${emailUnchanged}`);
  console.log(`  Password hash unchanged: ${passwordUnchanged}`);
  console.log(`  isActive unchanged: ${isActiveUnchanged}`);
  console.log(`  emailVerified unchanged: ${emailVerifiedUnchanged}`);
  console.log(`  createdAt unchanged: ${createdAtUnchanged}`);
  console.log(`  Role changed to SUPER_ADMIN: ${updated.role === "SUPER_ADMIN"}`);

  if (
    idUnchanged &&
    emailUnchanged &&
    passwordUnchanged &&
    isActiveUnchanged &&
    emailVerifiedUnchanged &&
    createdAtUnchanged &&
    updated.role === "SUPER_ADMIN"
  ) {
    console.log("\n✅ Migration successful - all safety checks passed");
  } else {
    console.log("\n❌ Migration verification failed");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });