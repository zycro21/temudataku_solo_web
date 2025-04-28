/*
  Warnings:

  - You are about to drop the column `practice_id` on the `practice_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,material_id]` on the table `practice_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "practice_progress" DROP CONSTRAINT "practice_progress_practice_id_fkey";

-- AlterTable
ALTER TABLE "practice_progress" DROP COLUMN "practice_id";

-- CreateIndex
CREATE UNIQUE INDEX "practice_progress_user_id_material_id_key" ON "practice_progress"("user_id", "material_id");
