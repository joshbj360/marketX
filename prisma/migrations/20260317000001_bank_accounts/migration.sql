-- CreateTable: BankAccount for seller payout destinations
CREATE TABLE "BankAccount" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "sellerId"      UUID NOT NULL,
  "bankName"      TEXT NOT NULL,
  "bankCode"      TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName"   TEXT NOT NULL,
  "isDefault"     BOOLEAN NOT NULL DEFAULT false,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
