-- CreateEnum
CREATE TYPE "CardGrade" AS ENUM ('common', 'rare', 'super_rare', 'legendary');

-- CreateEnum
CREATE TYPE "CardGenre" AS ENUM ('travel', 'landscape', 'portrait', 'object');

-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('join', 'draw', 'exchange', 'refund');

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" INTEGER NOT NULL,
    "grade" "CardGrade" NOT NULL,
    "genre" "CardGenre" NOT NULL,
    "description" TEXT,
    "totalQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchanges" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "offeredCardId" TEXT NOT NULL,
    "targetCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "pointType" "PointType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "point_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "points_userId_key" ON "points"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shops_cardId_key" ON "shops"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_offeredCardId_fkey" FOREIGN KEY ("offeredCardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_histories" ADD CONSTRAINT "point_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
