/*
  Warnings:

  - A unique constraint covering the columns `[display_number]` on the table `e_learning_certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_number` to the `e_learning_certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "e_learning_certificates" ADD COLUMN     "display_number" VARCHAR NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_certificates_display_number_key" ON "e_learning_certificates"("display_number");
