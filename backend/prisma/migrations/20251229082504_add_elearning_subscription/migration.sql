/*
  Warnings:

  - You are about to drop the column `price` on the `e_learning_courses` table. All the data in the column will be lost.
  - You are about to drop the column `e_learning_purchase_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `e_learning_purchases` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[e_learning_subscription_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "e_learning_purchases" DROP CONSTRAINT "e_learning_purchases_courseId_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_purchases" DROP CONSTRAINT "e_learning_purchases_referralUsageId_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_purchases" DROP CONSTRAINT "e_learning_purchases_userId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_e_learning_purchase_id_fkey";

-- DropIndex
DROP INDEX "payments_e_learning_purchase_id_key";

-- AlterTable
ALTER TABLE "e_learning_courses" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "e_learning_purchase_id",
ADD COLUMN     "e_learning_subscription_id" TEXT;

-- DropTable
DROP TABLE "e_learning_purchases";

-- CreateTable
CREATE TABLE "e_learning_subscription_plans" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "durationDay" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "e_learning_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "referralUsageId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "e_learning_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_subscriptions_referralUsageId_key" ON "e_learning_subscriptions"("referralUsageId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_e_learning_subscription_id_key" ON "payments"("e_learning_subscription_id");

-- AddForeignKey
ALTER TABLE "e_learning_subscriptions" ADD CONSTRAINT "e_learning_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_subscriptions" ADD CONSTRAINT "e_learning_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "e_learning_subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_subscriptions" ADD CONSTRAINT "e_learning_subscriptions_referralUsageId_fkey" FOREIGN KEY ("referralUsageId") REFERENCES "referral_usages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_e_learning_subscription_id_fkey" FOREIGN KEY ("e_learning_subscription_id") REFERENCES "e_learning_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
