/*
  Warnings:

  - The `alumni_portfolio` column on the `mentoring_services` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "mentoring_services" ADD COLUMN     "category" VARCHAR,
ADD COLUMN     "level" VARCHAR,
ADD COLUMN     "testimonials" JSONB,
DROP COLUMN "alumni_portfolio",
ADD COLUMN     "alumni_portfolio" JSONB;
