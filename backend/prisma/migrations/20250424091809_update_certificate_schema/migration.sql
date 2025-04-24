/*
  Warnings:

  - A unique constraint covering the columns `[mentee_id,service_id]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "note" VARCHAR,
ADD COLUMN     "verified_by" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_mentee_id_service_id_key" ON "certificates"("mentee_id", "service_id");
