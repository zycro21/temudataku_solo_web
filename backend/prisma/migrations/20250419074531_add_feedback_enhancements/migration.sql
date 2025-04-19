/*
  Warnings:

  - A unique constraint covering the columns `[session_id,user_id]` on the table `feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(6);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_session_id_user_id_key" ON "feedback"("session_id", "user_id");
