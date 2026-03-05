/*
  Warnings:

  - A unique constraint covering the columns `[certificate_number]` on the table `e_learning_certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificate_number` to the `e_learning_certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "e_learning_certificates" ADD COLUMN     "certificate_number" VARCHAR NOT NULL,
ADD COLUMN     "certificate_path" VARCHAR,
ADD COLUMN     "note" VARCHAR,
ADD COLUMN     "status" VARCHAR,
ADD COLUMN     "verified_by" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_certificates_certificate_number_key" ON "e_learning_certificates"("certificate_number");
