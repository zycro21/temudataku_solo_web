-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('QUIZ', 'PROJECT', 'QUIZ_AND_PROJECT');

-- AlterTable
ALTER TABLE "e_learning_sub_babs" ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "e_learning_sub_chapters" ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "task_type" "TaskType";

-- AlterTable
ALTER TABLE "e_learning_texts" ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "e_learning_sub_chapter_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_learning_sub_chapter_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_text_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text_id" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_accessed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_learning_text_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "e_learning_sub_chapter_progress_user_id_idx" ON "e_learning_sub_chapter_progress"("user_id");

-- CreateIndex
CREATE INDEX "e_learning_sub_chapter_progress_sub_chapter_id_idx" ON "e_learning_sub_chapter_progress"("sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_sub_chapter_progress_user_id_sub_chapter_id_key" ON "e_learning_sub_chapter_progress"("user_id", "sub_chapter_id");

-- CreateIndex
CREATE INDEX "e_learning_text_progress_user_id_idx" ON "e_learning_text_progress"("user_id");

-- CreateIndex
CREATE INDEX "e_learning_text_progress_text_id_idx" ON "e_learning_text_progress"("text_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_progress_user_id_text_id_key" ON "e_learning_text_progress"("user_id", "text_id");

-- AddForeignKey
ALTER TABLE "e_learning_sub_chapter_progress" ADD CONSTRAINT "e_learning_sub_chapter_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_sub_chapter_progress" ADD CONSTRAINT "e_learning_sub_chapter_progress_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_progress" ADD CONSTRAINT "e_learning_text_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_progress" ADD CONSTRAINT "e_learning_text_progress_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "e_learning_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
