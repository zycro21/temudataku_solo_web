/*
  Warnings:

  - The `tags` column on the `practices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "practices" DROP COLUMN "tags",
ADD COLUMN     "tags" VARCHAR[];
