-- CreateEnum
CREATE TYPE "ELearningInteractiveType" AS ENUM ('MATCHING', 'DRAG_DROP', 'TRUE_FALSE', 'FILL_BLANK');

-- CreateEnum
CREATE TYPE "MatchingItemSide" AS ENUM ('LEFT', 'RIGHT');

-- CreateTable
CREATE TABLE "e_learning_text_interactives" (
    "id" TEXT NOT NULL,
    "text_id" TEXT NOT NULL,
    "type" "ELearningInteractiveType" NOT NULL,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_text_interactives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_matching_questions" (
    "id" TEXT NOT NULL,
    "interactive_id" TEXT NOT NULL,
    "title" TEXT,
    "instruction" TEXT,
    "maxScore" DOUBLE PRECISION DEFAULT 100,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_matching_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_matching_items" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "side" "MatchingItemSide" NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "match_with_id" TEXT,

    CONSTRAINT "e_learning_matching_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_text_interactive_attempts" (
    "id" TEXT NOT NULL,
    "interactiveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "isPassed" BOOLEAN,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "e_learning_text_interactive_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_matching_attempts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_matching_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_matching_questions_interactive_id_key" ON "e_learning_matching_questions"("interactive_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_interactive_attempts_interactiveId_userId_a_key" ON "e_learning_text_interactive_attempts"("interactiveId", "userId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_matching_attempts_sessionId_questionId_key" ON "e_learning_matching_attempts"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "e_learning_text_interactives" ADD CONSTRAINT "e_learning_text_interactives_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "e_learning_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_matching_questions" ADD CONSTRAINT "e_learning_matching_questions_interactive_id_fkey" FOREIGN KEY ("interactive_id") REFERENCES "e_learning_text_interactives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_matching_items" ADD CONSTRAINT "e_learning_matching_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "e_learning_matching_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_interactive_attempts" ADD CONSTRAINT "e_learning_text_interactive_attempts_interactiveId_fkey" FOREIGN KEY ("interactiveId") REFERENCES "e_learning_text_interactives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_interactive_attempts" ADD CONSTRAINT "e_learning_text_interactive_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_matching_attempts" ADD CONSTRAINT "e_learning_matching_attempts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "e_learning_text_interactive_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
