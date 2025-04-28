/*
  Warnings:

  - The `thumbnail_image` column on the `practices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "practices" DROP COLUMN "thumbnail_image",
ADD COLUMN     "thumbnail_image" VARCHAR[];
