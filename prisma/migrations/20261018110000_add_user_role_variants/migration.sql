-- Add missing UserRole enum variants (must be outside transaction)
-- This migration must be applied separately from other migrations
-- because ALTER TYPE ... ADD VALUE cannot run inside a transaction block.

ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'JUNIOR_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'STAFF';