/*
  Warnings:

  - You are about to drop the column `owner_id` on the `commission_payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "commission_payments" DROP CONSTRAINT "commission_payments_owner_id_fkey";

-- AlterTable
ALTER TABLE "commission_payments" DROP COLUMN "owner_id",
ADD COLUMN     "notes" TEXT;
