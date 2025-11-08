/*
  Warnings:

  - A unique constraint covering the columns `[e_learning_purchase_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ELearningSubmissionStatus" AS ENUM ('PENDING', 'REVIEWED', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "e_learning_purchase_id" TEXT;

-- CreateTable
CREATE TABLE "e_learning_courses" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "thumbnail_images" VARCHAR[],
    "price" DECIMAL NOT NULL,
    "category" VARCHAR,
    "tags" VARCHAR[],
    "targetAudience" VARCHAR,
    "level" VARCHAR,
    "estimatedDuration" VARCHAR,
    "benefits" TEXT,
    "toolsUsed" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_sub_chapters" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "order_number" INTEGER NOT NULL,
    "estimatedTime" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_sub_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_videos" (
    "id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "videoUrl" VARCHAR NOT NULL,
    "durationSeconds" INTEGER,
    "orderNumber" INTEGER,
    "isPreview" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_quizzes" (
    "id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "totalQuestions" INTEGER,
    "timeLimitMinutes" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" VARCHAR[],
    "correctAnswer" VARCHAR NOT NULL,
    "explanation" TEXT,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_quiz_attempts" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER,
    "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "answers" JSONB,
    "isAutoGraded" BOOLEAN DEFAULT true,
    "graded_by" TEXT,
    "gradedAt" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "e_learning_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_assignments" (
    "id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "dueDays" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_submissions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notes" TEXT,
    "files" VARCHAR[],
    "submittedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" "ELearningSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "score" INTEGER,
    "gradeBreakdown" JSONB,
    "isRevisionRequired" BOOLEAN DEFAULT false,
    "revisionDeadline" TIMESTAMP(3),

    CONSTRAINT "e_learning_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "referralUsageId" TEXT,
    "purchaseDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "e_learning_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "isCompleted" BOOLEAN DEFAULT false,
    "lastAccessed" TIMESTAMP(3),
    "timeSpent" INTEGER DEFAULT 0,

    CONSTRAINT "e_learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_certificates" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "certificateUrl" VARCHAR NOT NULL,
    "issuedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_discussions" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_quizzes_sub_chapter_id_key" ON "e_learning_quizzes"("sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_quiz_attempts_quiz_id_user_id_key" ON "e_learning_quiz_attempts"("quiz_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_assignments_sub_chapter_id_key" ON "e_learning_assignments"("sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_submissions_assignment_id_user_id_key" ON "e_learning_submissions"("assignment_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_purchases_referralUsageId_key" ON "e_learning_purchases"("referralUsageId");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_progress_user_id_sub_chapter_id_key" ON "e_learning_progress"("user_id", "sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_reviews_user_id_course_id_key" ON "e_learning_reviews"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_certificates_user_id_course_id_key" ON "e_learning_certificates"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_bookmarks_user_id_sub_chapter_id_key" ON "e_learning_bookmarks"("user_id", "sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_e_learning_purchase_id_key" ON "payments"("e_learning_purchase_id");

-- AddForeignKey
ALTER TABLE "e_learning_courses" ADD CONSTRAINT "e_learning_courses_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_sub_chapters" ADD CONSTRAINT "e_learning_sub_chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_videos" ADD CONSTRAINT "e_learning_videos_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_quizzes" ADD CONSTRAINT "e_learning_quizzes_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_questions" ADD CONSTRAINT "e_learning_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "e_learning_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_quiz_attempts" ADD CONSTRAINT "e_learning_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "e_learning_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_quiz_attempts" ADD CONSTRAINT "e_learning_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_assignments" ADD CONSTRAINT "e_learning_assignments_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_submissions" ADD CONSTRAINT "e_learning_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "e_learning_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_submissions" ADD CONSTRAINT "e_learning_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_submissions" ADD CONSTRAINT "e_learning_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_purchases" ADD CONSTRAINT "e_learning_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_purchases" ADD CONSTRAINT "e_learning_purchases_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_purchases" ADD CONSTRAINT "e_learning_purchases_referralUsageId_fkey" FOREIGN KEY ("referralUsageId") REFERENCES "referral_usages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_progress" ADD CONSTRAINT "e_learning_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_progress" ADD CONSTRAINT "e_learning_progress_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_reviews" ADD CONSTRAINT "e_learning_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_reviews" ADD CONSTRAINT "e_learning_reviews_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_certificates" ADD CONSTRAINT "e_learning_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_certificates" ADD CONSTRAINT "e_learning_certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_discussions" ADD CONSTRAINT "e_learning_discussions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_discussions" ADD CONSTRAINT "e_learning_discussions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_discussions" ADD CONSTRAINT "e_learning_discussions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "e_learning_discussions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_bookmarks" ADD CONSTRAINT "e_learning_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_bookmarks" ADD CONSTRAINT "e_learning_bookmarks_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_e_learning_purchase_id_fkey" FOREIGN KEY ("e_learning_purchase_id") REFERENCES "e_learning_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
