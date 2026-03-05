/*
  Warnings:

  - You are about to alter the column `rating` on the `e_learning_reviews` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(2,1)`.

*/
-- AlterTable
ALTER TABLE "e_learning_reviews" ALTER COLUMN "rating" SET DATA TYPE DECIMAL(2,1);
