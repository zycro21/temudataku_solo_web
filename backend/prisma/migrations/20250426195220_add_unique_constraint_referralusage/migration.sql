/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `practice_purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,referralCodeId]` on the table `referral_usages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "practice_purchases_referralUsageId_key";

-- CreateIndex
CREATE UNIQUE INDEX "practice_purchases_paymentId_key" ON "practice_purchases"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_usages_userId_referralCodeId_key" ON "referral_usages"("userId", "referralCodeId");
