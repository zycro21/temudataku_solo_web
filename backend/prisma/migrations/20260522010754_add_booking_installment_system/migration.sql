/*
  Warnings:

  - You are about to drop the column `booking_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropIndex
DROP INDEX "payments_booking_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "booking_id",
ADD COLUMN     "booking_invoice_id" TEXT,
ADD COLUMN     "installment_number" INTEGER;

-- CreateTable
CREATE TABLE "booking_invoices" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL NOT NULL,
    "paymentType" VARCHAR NOT NULL,
    "installmentCount" INTEGER,
    "status" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "booking_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_invoices_bookingId_key" ON "booking_invoices"("bookingId");

-- CreateIndex
CREATE INDEX "payments_booking_invoice_id_idx" ON "payments"("booking_invoice_id");

-- AddForeignKey
ALTER TABLE "booking_invoices" ADD CONSTRAINT "booking_invoices_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_invoice_id_fkey" FOREIGN KEY ("booking_invoice_id") REFERENCES "booking_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
