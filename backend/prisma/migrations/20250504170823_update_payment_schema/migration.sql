/*
  Warnings:

  - You are about to drop the column `paymentId` on the `practice_purchases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[practice_purchase_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_paymentId_fkey";

-- DropIndex
DROP INDEX "practice_purchases_paymentId_key";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "practice_purchase_id" TEXT;

-- AlterTable
ALTER TABLE "practice_purchases" DROP COLUMN "paymentId";

-- CreateIndex
CREATE UNIQUE INDEX "payments_practice_purchase_id_key" ON "payments"("practice_purchase_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_practice_purchase_id_fkey" FOREIGN KEY ("practice_purchase_id") REFERENCES "practice_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
