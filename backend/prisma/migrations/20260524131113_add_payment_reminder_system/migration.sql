/*
  Warnings:

  - You are about to drop the column `reminder_sent` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reminder_sent_at` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "reminder_sent",
DROP COLUMN "reminder_sent_at",
ADD COLUMN     "last_reminder_sent_at" TIMESTAMP(3),
ADD COLUMN     "reminder_count" INTEGER NOT NULL DEFAULT 0;
