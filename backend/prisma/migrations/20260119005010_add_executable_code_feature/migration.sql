-- CreateEnum
CREATE TYPE "CodeLanguage" AS ENUM ('PYTHON', 'JAVASCRIPT', 'CPP', 'SQL', 'R');

-- AlterEnum
ALTER TYPE "ELearningAnchoredContentType" ADD VALUE 'CODE';

-- CreateTable
CREATE TABLE "e_learning_executable_codes" (
    "id" TEXT NOT NULL,
    "text_id" TEXT NOT NULL,
    "title" VARCHAR,
    "description" TEXT,
    "language" "CodeLanguage" NOT NULL,
    "initialCode" TEXT NOT NULL,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_executable_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_code_runs" (
    "id" TEXT NOT NULL,
    "executable_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "executionTime" INTEGER,
    "isSuccess" BOOLEAN DEFAULT false,

    CONSTRAINT "e_learning_code_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "e_learning_code_runs_executable_id_idx" ON "e_learning_code_runs"("executable_id");

-- CreateIndex
CREATE INDEX "e_learning_code_runs_user_id_idx" ON "e_learning_code_runs"("user_id");

-- AddForeignKey
ALTER TABLE "e_learning_executable_codes" ADD CONSTRAINT "e_learning_executable_codes_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "e_learning_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_code_runs" ADD CONSTRAINT "e_learning_code_runs_executable_id_fkey" FOREIGN KEY ("executable_id") REFERENCES "e_learning_executable_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_code_runs" ADD CONSTRAINT "e_learning_code_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
