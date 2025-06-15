/*
  Warnings:

  - A unique constraint covering the columns `[referralUsageId]` on the table `practice_purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "practice_purchases_referralUsageId_key" ON "practice_purchases"("referralUsageId");
