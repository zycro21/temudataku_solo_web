/*
  Warnings:

  - A unique constraint covering the columns `[aycl_booking_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AYCLSectionType" AS ENUM ('PROGRAM_INFO', 'CHALLENGE', 'TARGET', 'DIFFERENTIATOR', 'BENEFIT', 'CLOSING');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "aycl_booking_id" TEXT;

-- CreateTable
CREATE TABLE "aycl_batches" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subHeadline" TEXT,
    "description" TEXT,
    "whatsappGroupLink" TEXT,
    "price" DECIMAL NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "aycl_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aycl_sections" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" "AYCLSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "aycl_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aycl_materials" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "aycl_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aycl_schedules" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "googleMeetLink" TEXT,
    "quota" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aycl_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aycl_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "referralUsageId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aycl_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aycl_participants" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aycl_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aycl_batches_slug_key" ON "aycl_batches"("slug");

-- CreateIndex
CREATE INDEX "aycl_sections_batchId_order_idx" ON "aycl_sections"("batchId", "order");

-- CreateIndex
CREATE INDEX "aycl_schedules_batchId_idx" ON "aycl_schedules"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "aycl_bookings_referralUsageId_key" ON "aycl_bookings"("referralUsageId");

-- CreateIndex
CREATE UNIQUE INDEX "aycl_participants_bookingId_scheduleId_key" ON "aycl_participants"("bookingId", "scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_aycl_booking_id_key" ON "payments"("aycl_booking_id");

-- AddForeignKey
ALTER TABLE "aycl_sections" ADD CONSTRAINT "aycl_sections_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "aycl_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_materials" ADD CONSTRAINT "aycl_materials_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "aycl_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_schedules" ADD CONSTRAINT "aycl_schedules_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "aycl_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_bookings" ADD CONSTRAINT "aycl_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_bookings" ADD CONSTRAINT "aycl_bookings_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "aycl_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_bookings" ADD CONSTRAINT "aycl_bookings_referralUsageId_fkey" FOREIGN KEY ("referralUsageId") REFERENCES "referral_usages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_participants" ADD CONSTRAINT "aycl_participants_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "aycl_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aycl_participants" ADD CONSTRAINT "aycl_participants_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "aycl_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_aycl_booking_id_fkey" FOREIGN KEY ("aycl_booking_id") REFERENCES "aycl_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
