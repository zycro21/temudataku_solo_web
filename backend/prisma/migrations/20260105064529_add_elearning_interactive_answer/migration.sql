/*
  Warnings:

  - You are about to drop the `e_learning_matching_attempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ELearningInteractiveType" ADD VALUE 'MULTIPLE_CHOICE';

-- DropForeignKey
ALTER TABLE "e_learning_matching_attempts" DROP CONSTRAINT "e_learning_matching_attempts_sessionId_fkey";

-- DropTable
DROP TABLE "e_learning_matching_attempts";

-- CreateTable
CREATE TABLE "ELearningMultipleChoiceQuestion" (
    "id" TEXT NOT NULL,
    "interactiveId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "maxScore" DOUBLE PRECISION DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ELearningMultipleChoiceQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningMultipleChoiceOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningMultipleChoiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_interactive_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "interactive_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_interactive_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ELearningMultipleChoiceQuestion_interactiveId_key" ON "ELearningMultipleChoiceQuestion"("interactiveId");

-- CreateIndex
CREATE INDEX "e_learning_interactive_answers_attempt_id_idx" ON "e_learning_interactive_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "e_learning_interactive_answers_interactive_id_idx" ON "e_learning_interactive_answers"("interactive_id");

-- CreateIndex
CREATE INDEX "e_learning_interactive_answers_user_id_idx" ON "e_learning_interactive_answers"("user_id");

-- AddForeignKey
ALTER TABLE "ELearningMultipleChoiceQuestion" ADD CONSTRAINT "ELearningMultipleChoiceQuestion_interactiveId_fkey" FOREIGN KEY ("interactiveId") REFERENCES "e_learning_text_interactives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningMultipleChoiceOption" ADD CONSTRAINT "ELearningMultipleChoiceOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ELearningMultipleChoiceQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_interactive_answers" ADD CONSTRAINT "e_learning_interactive_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "e_learning_text_interactive_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_interactive_answers" ADD CONSTRAINT "e_learning_interactive_answers_interactive_id_fkey" FOREIGN KEY ("interactive_id") REFERENCES "e_learning_text_interactives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_interactive_answers" ADD CONSTRAINT "e_learning_interactive_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
