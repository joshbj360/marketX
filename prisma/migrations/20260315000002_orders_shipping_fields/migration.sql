-- Add shipping provider tracking fields to Orders table
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS "labelUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingProvider" TEXT;
