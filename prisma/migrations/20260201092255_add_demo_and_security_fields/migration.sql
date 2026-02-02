-- DropForeignKey
ALTER TABLE "InventoryBalance" DROP CONSTRAINT "InventoryBalance_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "demoDataRetentionHours" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lockoutDurationMins" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "sessionTimeoutMins" INTEGER NOT NULL DEFAULT 480;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
