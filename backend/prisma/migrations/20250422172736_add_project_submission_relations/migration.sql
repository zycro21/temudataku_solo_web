/*
  Warnings:

  - You are about to drop the column `file_path` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `mentee_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `nilai` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `plagiarism_score` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `submission_date` on the `projects` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_mentee_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_session_id_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "file_path",
DROP COLUMN "mentee_id",
DROP COLUMN "nilai",
DROP COLUMN "plagiarism_score",
DROP COLUMN "session_id",
DROP COLUMN "submission_date",
ADD COLUMN     "service_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "project_submissions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "mentee_id" TEXT NOT NULL,
    "session_id" TEXT,
    "file_path" VARCHAR,
    "submission_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "plagiarism_score" DECIMAL,
    "Score" DECIMAL,
    "mentor_feedback" VARCHAR,
    "is_reviewed" BOOLEAN DEFAULT false,
    "graded_by" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "project_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
