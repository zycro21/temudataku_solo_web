/*
  Warnings:

  - You are about to drop the column `projects_data` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "projects_data",
ADD COLUMN     "project_certificate_path" VARCHAR;
