/*
  Warnings:

  - You are about to drop the column `Score` on the `project_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_submissions" DROP COLUMN "Score",
ADD COLUMN     "score" DECIMAL;
