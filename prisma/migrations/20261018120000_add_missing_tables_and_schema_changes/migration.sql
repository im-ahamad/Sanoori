-- Create business_settings table
CREATE TABLE "business_settings" (
    "id" VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "whatsapp" VARCHAR(255),
    "email" VARCHAR(255),
    "address" VARCHAR(255),
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "facebook" VARCHAR(255),
    "instagram" VARCHAR(255),
    "tiktok" VARCHAR(255),
    "youtube" VARCHAR(255),
    "telegram" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- Create admin_verifications table
CREATE TABLE "admin_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_verifications_email_key" ON "admin_verifications"("email");

-- Create login_challenges table
CREATE TABLE "login_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "sessionIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_challenges_userId_idx" ON "login_challenges"("userId");
CREATE INDEX "login_challenges_expiresAt_idx" ON "login_challenges"("expiresAt");

ALTER TABLE "login_challenges" ADD CONSTRAINT "login_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "permissions" JSONB NOT NULL DEFAULT '[]';

-- Add missing columns to products table
ALTER TABLE "products" ADD COLUMN "colorFinish" TEXT;
ALTER TABLE "products" ADD COLUMN "madeIn" TEXT;
ALTER TABLE "products" ADD COLUMN "material" TEXT;
ALTER TABLE "products" ADD COLUMN "showOnHome" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "showOnProducts" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "size" TEXT;

-- Convert products.specifications from JSONB to TEXT[] (Prisma String[] -> PostgreSQL TEXT[])
-- Table is empty (0 rows verified), safe to convert directly
ALTER TABLE "products" ALTER COLUMN "specifications" TYPE TEXT[] USING '{}'::text[];

-- Note: shortDescription and variants are kept in Neon as-is (not in current schema)