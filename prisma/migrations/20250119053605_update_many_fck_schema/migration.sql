/*
  Warnings:

  - You are about to drop the column `cardId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `shops` table. All the data in the column will be lost.
  - Added the required column `status` to the `exchanges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('requested', 'accepted', 'rejected', 'completed');

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_cardId_fkey";

-- AlterTable
ALTER TABLE "exchanges" ADD COLUMN     "status" "ExchangeStatus" NOT NULL;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "cardId",
ADD COLUMN     "shopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "quantity",
ADD COLUMN     "initialQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "remainingQuantity" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
