/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `e_learning_questions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SupportingFileType" AS ENUM ('DATASET', 'TEMPLATE', 'REFERENCE');

-- AlterTable
ALTER TABLE "e_learning_questions" DROP COLUMN "correctAnswer",
ADD COLUMN     "correctAnswers" VARCHAR[];

-- CreateTable
CREATE TABLE "e_learning_assignment_instructions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "e_learning_assignment_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_assignment_supporting_files" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SupportingFileType" NOT NULL,
    "url" TEXT NOT NULL,
    "pageCount" INTEGER,
    "format" TEXT,
    "sizeKB" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_assignment_supporting_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_assignment_instructions_assignment_id_orderNumbe_key" ON "e_learning_assignment_instructions"("assignment_id", "orderNumber");

-- AddForeignKey
ALTER TABLE "e_learning_assignment_instructions" ADD CONSTRAINT "e_learning_assignment_instructions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "e_learning_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_assignment_supporting_files" ADD CONSTRAINT "e_learning_assignment_supporting_files_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "e_learning_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
