-- CreateTable: ProductOffer (volume-discount offers)
CREATE TABLE "ProductOffer" (
  "id"          SERIAL NOT NULL,
  "productId"   INTEGER NOT NULL,
  "minQuantity" INTEGER NOT NULL,
  "discount"    DOUBLE PRECISION NOT NULL,
  "label"       TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductOffer_productId_idx" ON "ProductOffer"("productId");

-- AddForeignKey
ALTER TABLE "ProductOffer"
  ADD CONSTRAINT "ProductOffer_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
