/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `e_learning_text_interactives` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `e_learning_texts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnchorPosition" AS ENUM ('BEFORE', 'AFTER', 'INLINE');

-- AlterTable
ALTER TABLE "e_learning_text_interactives" DROP COLUMN "orderNumber";

-- AlterTable
ALTER TABLE "e_learning_texts" DROP COLUMN "textContent";

-- CreateTable
CREATE TABLE "e_learning_text_blocks" (
    "id" TEXT NOT NULL,
    "text_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_text_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_text_interactive_anchors" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "interactive_id" TEXT NOT NULL,
    "orderNumber" INTEGER,
    "position" "AnchorPosition" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_text_interactive_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_blocks_text_id_order_key" ON "e_learning_text_blocks"("text_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_interactive_anchors_block_id_interactive_id_key" ON "e_learning_text_interactive_anchors"("block_id", "interactive_id");

-- AddForeignKey
ALTER TABLE "e_learning_text_blocks" ADD CONSTRAINT "e_learning_text_blocks_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "e_learning_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_interactive_anchors" ADD CONSTRAINT "e_learning_text_interactive_anchors_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "e_learning_text_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_text_interactive_anchors" ADD CONSTRAINT "e_learning_text_interactive_anchors_interactive_id_fkey" FOREIGN KEY ("interactive_id") REFERENCES "e_learning_text_interactives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
