/*
  Warnings:

  - Added the required column `date` to the `mentoring_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mentoring_sessions" ADD COLUMN     "date" DATE NOT NULL;
