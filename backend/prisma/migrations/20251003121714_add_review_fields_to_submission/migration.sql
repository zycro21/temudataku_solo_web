-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'REVIEWED', 'REVISION_REQUIRED');

-- AlterTable
ALTER TABLE "project_submissions" ADD COLUMN     "brief_score" INTEGER,
ADD COLUMN     "completeness_score" INTEGER,
ADD COLUMN     "creativity_score" INTEGER,
ADD COLUMN     "is_revised_required" BOOLEAN DEFAULT false,
ADD COLUMN     "mentor_suggestion" VARCHAR,
ADD COLUMN     "projectLink" VARCHAR,
ADD COLUMN     "review_status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "revision_deadline" TIMESTAMP(3),
ADD COLUMN     "technical_score" INTEGER,
ADD COLUMN     "title" VARCHAR;
