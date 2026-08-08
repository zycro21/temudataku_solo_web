/*
  Warnings:

  - You are about to drop the column `course_id` on the `e_learning_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `e_learning_reviews` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,sub_chapter_id]` on the table `e_learning_certificates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,sub_chapter_id]` on the table `e_learning_reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sub_chapter_id` to the `e_learning_certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_chapter_id` to the `e_learning_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "e_learning_certificates" DROP CONSTRAINT "e_learning_certificates_course_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_reviews" DROP CONSTRAINT "e_learning_reviews_course_id_fkey";

-- DropIndex
DROP INDEX "e_learning_certificates_user_id_course_id_key";

-- DropIndex
DROP INDEX "e_learning_reviews_user_id_course_id_key";

-- AlterTable
ALTER TABLE "e_learning_certificates" DROP COLUMN "course_id",
ADD COLUMN     "sub_chapter_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "e_learning_reviews" DROP COLUMN "course_id",
ADD COLUMN     "sub_chapter_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_certificates_user_id_sub_chapter_id_key" ON "e_learning_certificates"("user_id", "sub_chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_reviews_user_id_sub_chapter_id_key" ON "e_learning_reviews"("user_id", "sub_chapter_id");

-- AddForeignKey
ALTER TABLE "e_learning_reviews" ADD CONSTRAINT "e_learning_reviews_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_certificates" ADD CONSTRAINT "e_learning_certificates_sub_chapter_id_fkey" FOREIGN KEY ("sub_chapter_id") REFERENCES "e_learning_sub_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
