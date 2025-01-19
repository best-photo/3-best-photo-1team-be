/*
  Warnings:

  - You are about to alter the column `imageUrl` on the `cards` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.

*/
-- AlterEnum
ALTER TYPE "PointType" ADD VALUE 'purchase';

-- DropForeignKey
ALTER TABLE "cards" DROP CONSTRAINT "cards_ownerId_fkey";

-- AlterTable
ALTER TABLE "cards" ALTER COLUMN "imageUrl" SET DATA TYPE VARCHAR(2048);

-- CreateIndex
CREATE INDEX "cards_ownerId_idx" ON "cards"("ownerId");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
