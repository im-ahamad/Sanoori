import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const connectionString = process.env.DATABASE_URL ?? "";
const url = new URL(connectionString);
const database = url.pathname?.slice(1) || "sanoori_trading";

const adapter = new PrismaPg({ connectionString, database });
const db = new PrismaClient({ adapter });

async function main() {
  // Get complete migration metadata
  const migrations = await db.$queryRawUnsafe(`
    SELECT 
      id,
      migration_name,
      checksum,
      finished_at,
      migration_name,
      logs,
      rolled_back_at,
      started_at,
      applied_steps_count
    FROM "_prisma_migrations" 
    ORDER BY finished_at
  `);
  
  console.log("=== COMPLETE MIGRATION METADATA ===");
  for (const m of migrations) {
    console.log("\n--- Migration:", m.migration_name, "---");
    console.log("  id:", m.id);
    console.log("  checksum:", m.checksum);
    console.log("  started_at:", m.started_at);
    console.log("  finished_at:", m.finished_at);
    console.log("  applied_steps_count:", m.applied_steps_count);
    console.log("  rolled_back_at:", m.rolled_back_at);
    console.log("  logs:", m.logs);
  }
  
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });