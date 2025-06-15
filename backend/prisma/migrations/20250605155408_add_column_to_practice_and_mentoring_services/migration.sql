-- AlterTable
ALTER TABLE "mentoring_services" ADD COLUMN     "alumni_portfolio" TEXT,
ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "mechanism" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "syllabus_path" TEXT,
ADD COLUMN     "target_audience" TEXT,
ADD COLUMN     "tools_used" TEXT;

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "benefits" VARCHAR,
ADD COLUMN     "challenges" VARCHAR,
ADD COLUMN     "estimated_duration" VARCHAR,
ADD COLUMN     "expected_outcomes" VARCHAR,
ADD COLUMN     "target_audience" VARCHAR,
ADD COLUMN     "tools_used" VARCHAR;
