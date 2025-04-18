/*
  Warnings:

  - You are about to drop the column `mentor_id` on the `mentoring_services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "mentoring_services" DROP CONSTRAINT "mentoring_services_mentor_id_fkey";

-- AlterTable
ALTER TABLE "mentoring_services" DROP COLUMN "mentor_id";

-- CreateTable
CREATE TABLE "mentoring_service_mentors" (
    "id" TEXT NOT NULL,
    "mentoring_service_id" TEXT NOT NULL,
    "mentor_profile_id" TEXT NOT NULL,

    CONSTRAINT "mentoring_service_mentors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_service_mentors_mentoring_service_id_mentor_profi_key" ON "mentoring_service_mentors"("mentoring_service_id", "mentor_profile_id");

-- AddForeignKey
ALTER TABLE "mentoring_service_mentors" ADD CONSTRAINT "mentoring_service_mentors_mentoring_service_id_fkey" FOREIGN KEY ("mentoring_service_id") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_service_mentors" ADD CONSTRAINT "mentoring_service_mentors_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
