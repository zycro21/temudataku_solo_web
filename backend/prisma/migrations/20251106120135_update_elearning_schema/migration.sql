/*
  Warnings:

  - You are about to drop the column `sub_chapter_id` on the `e_learning_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `sub_chapter_id` on the `e_learning_bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `sub_chapter_id` on the `e_learning_progress` table. All the data in the column will be lost.
  - You are about to drop the column `sub_chapter_id` on the `e_learning_quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `sub_chapter_id` on the `e_learning_videos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sub_bab_id]` on the table `e_learning_assignments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,sub_bab_id]` on the table `e_learning_bookmarks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,sub_bab_id]` on the table `e_learning_progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sub_bab_id]` on the table `e_learning_quizzes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sub_bab_id` to the `e_learning_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_bab_id` to the `e_learning_bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_bab_id` to the `e_learning_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_bab_id` to the `e_learning_quizzes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_bab_id` to the `e_learning_videos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "e_learning_assignments" DROP CONSTRAINT "e_learning_assignments_sub_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_bookmarks" DROP CONSTRAINT "e_learning_bookmarks_sub_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_progress" DROP CONSTRAINT "e_learning_progress_sub_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_quizzes" DROP CONSTRAINT "e_learning_quizzes_sub_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_videos" DROP CONSTRAINT "e_learning_videos_sub_chapter_id_fkey";

-- DropIndex
DROP INDEX "e_learning_assignments_sub_chapter_id_key";

-- DropIndex
DROP INDEX "e_learning_bookmarks_user_id_sub_chapter_id_key";

-- DropIndex
DROP INDEX "e_learning_progress_user_id_sub_chapter_id_key";

-- DropIndex
DROP INDEX "e_learning_quizzes_sub_chapter_id_key";

-- AlterTable
ALTER TABLE "e_learning_assignments" DROP COLUMN "sub_chapter_id",
ADD COLUMN     "sub_bab_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "e_learning_bookmarks" DROP COLUMN "sub_chapter_id",
ADD COLUMN     "sub_bab_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "e_learning_progress" DROP COLUMN "sub_chapter_id",
ADD COLUMN     "sub_bab_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "e_learning_quizzes" DROP COLUMN "sub_chapter_id",
ADD COLUMN     "sub_bab_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "e_learning_videos" DROP COLUMN "sub_chapter_id",
ADD COLUMN     "sub_bab_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "e_learning_sub_babs" (
    "id" TEXT NOT NULL,
    "sub_chapter_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "orderNumber" INTEGER,
    "estimatedTime" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_sub_babs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_texts" (
    "id" TEXT NOT NULL,
    "sub_bab_id" TEXT NOT NULL,
    "title" VARCHAR,
    "textContent" TEXT NOT NULL,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_texts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_assignments_sub_bab_id_key" ON "e_learning_assignments"("sub_bab_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_bookmarks_user_id_sub_bab_id_key" ON "e_learning_bookmarks"("user_id", "sub_bab_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_progress_user_id_sub_bab_id_key" ON "e_learning_progress"("user_id", "sub_bab_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_quizzes_sub_bab_id_key" ON "e_learning_quizzes"("sub_bab_id");

-- AddForeignKey
ALTER TABLE "e_learning_sub_babs" ADD CONSTRAINT "e_learning_sub_babs_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_texts" ADD CONSTRAINT "e_learning_texts_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_videos" ADD CONSTRAINT "e_learning_videos_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_quizzes" ADD CONSTRAINT "e_learning_quizzes_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_assignments" ADD CONSTRAINT "e_learning_assignments_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_progress" ADD CONSTRAINT "e_learning_progress_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_bookmarks" ADD CONSTRAINT "e_learning_bookmarks_sub_bab_id_fkey" FOREIGN KEY ("sub_bab_id") REFERENCES "e_learning_sub_babs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
