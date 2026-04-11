-- Add shippedAt timestamp to Orders
ALTER TABLE "Orders" ADD COLUMN "shippedAt" TIMESTAMPTZ;
