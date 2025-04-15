/*
  Warnings:

  - You are about to drop the column `booking_date` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `mentee_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `special_requests` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `practice_id` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_date` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `referral_code_id` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `practice_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `commission_percentage` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `created_date` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `discount_percentage` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `referral_codes` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `referral_codes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referralUsageId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[booking_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralUsageId]` on the table `practice_purchases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `menteeId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practiceId` to the `practice_purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `practice_purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionPercentage` to the `referral_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountPercentage` to the `referral_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `referral_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_mentee_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_session_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_referral_code_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_user_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_codes" DROP CONSTRAINT "referral_codes_owner_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "booking_date",
DROP COLUMN "created_at",
DROP COLUMN "mentee_id",
DROP COLUMN "session_id",
DROP COLUMN "special_requests",
DROP COLUMN "updated_at",
ADD COLUMN     "bookingDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "menteeId" TEXT NOT NULL,
ADD COLUMN     "referralUsageId" TEXT,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "practice_purchases" DROP COLUMN "created_at",
DROP COLUMN "payment_id",
DROP COLUMN "practice_id",
DROP COLUMN "purchase_date",
DROP COLUMN "referral_code_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "practiceId" TEXT NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "referralUsageId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "referral_codes" DROP COLUMN "commission_percentage",
DROP COLUMN "created_at",
DROP COLUMN "created_date",
DROP COLUMN "discount_percentage",
DROP COLUMN "expiry_date",
DROP COLUMN "is_active",
DROP COLUMN "owner_id",
DROP COLUMN "updated_at",
ADD COLUMN     "commissionPercentage" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discountPercentage" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "code" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "referral_usages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "referral_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_referralUsageId_key" ON "bookings"("referralUsageId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_purchases_referralUsageId_key" ON "practice_purchases"("referralUsageId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mentoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_referralUsageId_fkey" FOREIGN KEY ("referralUsageId") REFERENCES "referral_usages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_referralUsageId_fkey" FOREIGN KEY ("referralUsageId") REFERENCES "referral_usages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_usages" ADD CONSTRAINT "referral_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_usages" ADD CONSTRAINT "referral_usages_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
