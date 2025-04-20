/*
  Warnings:

  - You are about to drop the column `sessionId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `mentoring_service_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_sessionId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "sessionId",
ADD COLUMN     "mentoring_service_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_mentoring_service_id_fkey" FOREIGN KEY ("mentoring_service_id") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
