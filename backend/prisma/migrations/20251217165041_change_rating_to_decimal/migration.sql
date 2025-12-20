/*
  Warnings:

  - You are about to alter the column `rating` on the `feedback` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE "feedback" ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,1);
