-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "exchangeDescription" TEXT,
ADD COLUMN     "exchangeGenre" "CardGenre" NOT NULL DEFAULT 'travel',
ADD COLUMN     "exchangeGrade" "CardGrade" NOT NULL DEFAULT 'common',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;
