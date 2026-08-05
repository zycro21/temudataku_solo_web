/*
  Warnings:

  - A unique constraint covering the columns `[assignment_id,user_id,attempt_number]` on the table `e_learning_submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "e_learning_submissions_assignment_id_user_id_key";

-- AlterTable
ALTER TABLE "e_learning_submissions" ADD COLUMN     "attempt_number" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_submissions_assignment_id_user_id_attempt_number_key" ON "e_learning_submissions"("assignment_id", "user_id", "attempt_number");
