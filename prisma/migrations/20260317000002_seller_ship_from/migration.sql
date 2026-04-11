-- AddColumn: Seller shipping origin fields
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromName"    TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromAddress" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromCity"    TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromState"   TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromZip"     TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromCountry" TEXT NOT NULL DEFAULT 'NG';
ALTER TABLE "SellerProfile" ADD COLUMN "shipFromPhone"   TEXT;
