import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const db = new PrismaClient({ adapter });
const user = await db.user.findUnique({ where: { email: "sanoori.trading@gmail.com" } });
if (user) {
  const h = user.passwordHash;
  console.log("hash length:", h.length, "prefix:", h.slice(0, 7));
  const candidates = ["sanoori", "sanoori123", "admin", "admin123", "password", "sanoori.trading", "Sanoori123", "sanoori@123", "trading", "sanoori2024", "sanoori2025"];
  for (const c of candidates) {
    if (await bcrypt.compare(c, h)) {
      console.log("MATCH found for a candidate");
      process.exit(0);
    }
  }
  console.log("no candidate matched");
}
await db.$disconnect();
