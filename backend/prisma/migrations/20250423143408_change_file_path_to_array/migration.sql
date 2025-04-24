/*
  Warnings:

  - You are about to drop the column `file_path` on the `project_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_submissions" DROP COLUMN "file_path",
ADD COLUMN     "file_paths" TEXT[];
