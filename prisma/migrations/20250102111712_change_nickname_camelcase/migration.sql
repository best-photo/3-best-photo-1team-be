/*
  Warnings:

  - You are about to drop the column `nickName` on the `users` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "nickName",
ADD COLUMN     "nickname" VARCHAR(50) NOT NULL;
