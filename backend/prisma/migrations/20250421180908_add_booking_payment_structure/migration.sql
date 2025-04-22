-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "payment_id" TEXT,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
