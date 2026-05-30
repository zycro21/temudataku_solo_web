-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder_sent_at" TIMESTAMP(3);
