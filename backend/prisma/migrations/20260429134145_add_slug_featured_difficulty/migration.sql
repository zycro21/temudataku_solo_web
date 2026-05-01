/*
  Warnings:

  - You are about to drop the column `alumni_portfolio` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `mechanism` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `syllabus_path` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `target_audience` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `testimonials` on the `mentoring_services` table. All the data in the column will be lost.
  - You are about to drop the column `tools_used` on the `mentoring_services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `mentoring_services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MentoringSectionType" AS ENUM ('BENEFIT', 'MECHANISM', 'SYLLABUS', 'TARGET');

-- AlterTable
ALTER TABLE "mentoring_services" DROP COLUMN "alumni_portfolio",
DROP COLUMN "benefits",
DROP COLUMN "mechanism",
DROP COLUMN "schedule",
DROP COLUMN "syllabus_path",
DROP COLUMN "target_audience",
DROP COLUMN "testimonials",
DROP COLUMN "tools_used",
ADD COLUMN     "difficulty_order" INTEGER,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "program_about" TEXT,
ADD COLUMN     "slug" VARCHAR,
ADD COLUMN     "strike_price" DECIMAL,
ADD COLUMN     "total_projects" INTEGER,
ADD COLUMN     "total_weeks" INTEGER,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "mentoring_sections" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" "MentoringSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "mentoring_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_tools" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "mentoring_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_schedules" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentoring_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_portfolios" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "menteeName" TEXT NOT NULL,
    "projectLink" TEXT NOT NULL,
    "thumbnail" TEXT,

    CONSTRAINT "mentoring_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring_testimonials" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "mentoring_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mentoring_sections_serviceId_order_idx" ON "mentoring_sections"("serviceId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_services_slug_key" ON "mentoring_services"("slug");

-- AddForeignKey
ALTER TABLE "mentoring_sections" ADD CONSTRAINT "mentoring_sections_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_tools" ADD CONSTRAINT "mentoring_tools_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_schedules" ADD CONSTRAINT "mentoring_schedules_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_portfolios" ADD CONSTRAINT "mentoring_portfolios_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_testimonials" ADD CONSTRAINT "mentoring_testimonials_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "mentoring_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
