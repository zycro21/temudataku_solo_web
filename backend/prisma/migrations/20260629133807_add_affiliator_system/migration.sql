/*
  Warnings:

  - You are about to drop the column `commissionPercentage` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercentage` on the `referral_codes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "referral_codes" DROP COLUMN "commissionPercentage",
DROP COLUMN "discountPercentage";

-- AlterTable
ALTER TABLE "referral_commisions" ADD COLUMN     "pointsAwarded" INTEGER,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "seasonId" TEXT,
ADD COLUMN     "tierAtTransaction" TEXT;

-- CreateTable
CREATE TABLE "affiliator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "affiliator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliator_seasons" (
    "id" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliator_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliator_season_points" (
    "id" TEXT NOT NULL,
    "affiliatorProfileId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tierAtSeasonStart" TEXT NOT NULL,
    "tierAtSeasonEnd" TEXT,
    "maintenanceQuotaMet" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "affiliator_season_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliator_product_configs" (
    "id" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "commissionAmount" DECIMAL(65,30),
    "discountAmount" DECIMAL(65,30),
    "commissionPercent" DECIMAL(65,30),
    "discountPercent" DECIMAL(65,30),
    "pointsAwarded" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "affiliator_product_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliator_profiles_userId_key" ON "affiliator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliator_season_points_affiliatorProfileId_seasonId_key" ON "affiliator_season_points"("affiliatorProfileId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliator_product_configs_productType_tier_key" ON "affiliator_product_configs"("productType", "tier");

-- AddForeignKey
ALTER TABLE "affiliator_profiles" ADD CONSTRAINT "affiliator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliator_season_points" ADD CONSTRAINT "affiliator_season_points_affiliatorProfileId_fkey" FOREIGN KEY ("affiliatorProfileId") REFERENCES "affiliator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliator_season_points" ADD CONSTRAINT "affiliator_season_points_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "affiliator_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commisions" ADD CONSTRAINT "referral_commisions_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "affiliator_seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
