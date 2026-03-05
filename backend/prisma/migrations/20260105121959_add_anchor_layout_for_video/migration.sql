/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `e_learning_videos` table. All the data in the column will be lost.
  - You are about to drop the `e_learning_text_interactive_anchors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ELearningAnchoredContentType" AS ENUM ('INTERACTIVE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "e_learning_interactive_answers" DROP CONSTRAINT "e_learning_interactive_answers_interactive_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_interactive_anchors" DROP CONSTRAINT "e_learning_text_interactive_anchors_block_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_interactive_anchors" DROP CONSTRAINT "e_learning_text_interactive_anchors_interactive_id_fkey";

-- AlterTable
ALTER TABLE "e_learning_videos" DROP COLUMN "orderNumber";

-- DropTable
DROP TABLE "e_learning_text_interactive_anchors";

-- CreateTable
CREATE TABLE "e_learning_text_content_anchors" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "contentType" "ELearningAnchoredContentType" NOT NULL,
    "content_id" TEXT NOT NULL,
    "orderNumber" INTEGER,
    "position" "AnchorPosition" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_text_content_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_content_anchors_block_id_contentType_conten_key" ON "e_learning_text_content_anchors"("block_id", "contentType", "content_id");

-- AddForeignKey
ALTER TABLE "e_learning_text_content_anchors" ADD CONSTRAINT "e_learning_text_content_anchors_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "e_learning_text_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_interactive_answers" ADD CONSTRAINT "e_learning_interactive_answers_interactive_id_fkey" FOREIGN KEY ("interactive_id") REFERENCES "e_learning_text_interactives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
