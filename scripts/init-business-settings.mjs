import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Connection string:', connectionString);

// Parse database name from postgresql://user@host:port/dbname
const match = connectionString.match(/\/([^?]+)(\?.*)?$/);
const database = match ? match[1] : undefined;
console.log('Parsed database:', database);

const adapter = new PrismaPg({
  connectionString,
  ...(database && { database }),
});

const db = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Checking for existing BusinessSettings...');
    const existing = await db.businessSettings.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (existing) {
      console.log('BusinessSettings already exists:', existing.id);
      return;
    }

    console.log('Creating initial BusinessSettings...');
    const created = await db.businessSettings.create({
      data: {
        name: 'Sanoori Trading',
        phone: '[BUSINESS PHONE]',
        whatsapp: '[WHATSAPP NUMBER]',
        email: '[BUSINESS EMAIL]',
        address: '[BUSINESS ADDRESS]',
        city: '[BUSINESS CITY]',
        country: 'Bangladesh',
        facebook: '[FACEBOOK URL]',
        instagram: '[INSTAGRAM URL]',
        tiktok: '[TIKTOK URL]',
        youtube: '[YOUTUBE URL]',
        telegram: '[TELEGRAM URL]',
      },
    });

    console.log('BusinessSettings created:', created.id);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await db.$disconnect();
  }
}

main();