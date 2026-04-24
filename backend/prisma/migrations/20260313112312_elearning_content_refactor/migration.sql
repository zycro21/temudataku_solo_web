/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ELearningMultipleChoiceQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `interactiveId` on the `ELearningMultipleChoiceQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `ELearningMultipleChoiceQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `text_id` on the `e_learning_executable_codes` table. All the data in the column will be lost.
  - You are about to drop the column `interactive_id` on the `e_learning_matching_questions` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `e_learning_text_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `e_learning_text_blocks` table. All the data in the column will be lost.
  - You are about to drop the `e_learning_interactive_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `e_learning_text_content_anchors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `e_learning_text_interactive_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `e_learning_text_interactives` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `e_learning_videos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[additionalContentId]` on the table `ELearningMultipleChoiceQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `e_learning_courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[additional_content_id]` on the table `e_learning_executable_codes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[additional_content_id]` on the table `e_learning_matching_questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[text_id,orderNumber]` on the table `e_learning_text_blocks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `additionalContentId` to the `ELearningMultipleChoiceQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additional_content_id` to the `e_learning_executable_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additional_content_id` to the `e_learning_matching_questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('HEADING', 'PARAGRAPH', 'ACCORDION', 'CAROUSEL', 'CONTENT_CARD', 'TAB_NAVIGATION', 'HIGHLIGHT', 'SUMMARY');

-- CreateEnum
CREATE TYPE "AdditionalContentType" AS ENUM ('IMAGE_VIDEO', 'MULTIPLE_CHOICE', 'MATCHING', 'INTERACTIVE_CODE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "ELearningMultipleChoiceQuestion" DROP CONSTRAINT "ELearningMultipleChoiceQuestion_interactiveId_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_executable_codes" DROP CONSTRAINT "e_learning_executable_codes_text_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_interactive_answers" DROP CONSTRAINT "e_learning_interactive_answers_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_interactive_answers" DROP CONSTRAINT "e_learning_interactive_answers_interactive_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_interactive_answers" DROP CONSTRAINT "e_learning_interactive_answers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_matching_questions" DROP CONSTRAINT "e_learning_matching_questions_interactive_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_content_anchors" DROP CONSTRAINT "e_learning_text_content_anchors_block_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_interactive_attempts" DROP CONSTRAINT "e_learning_text_interactive_attempts_interactiveId_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_interactive_attempts" DROP CONSTRAINT "e_learning_text_interactive_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_text_interactives" DROP CONSTRAINT "e_learning_text_interactives_text_id_fkey";

-- DropForeignKey
ALTER TABLE "e_learning_videos" DROP CONSTRAINT "e_learning_videos_sub_bab_id_fkey";

-- DropIndex
DROP INDEX "ELearningMultipleChoiceQuestion_interactiveId_key";

-- DropIndex
DROP INDEX "e_learning_matching_questions_interactive_id_key";

-- DropIndex
DROP INDEX "e_learning_text_blocks_text_id_order_key";

-- AlterTable
ALTER TABLE "ELearningMultipleChoiceQuestion" DROP COLUMN "createdAt",
DROP COLUMN "interactiveId",
DROP COLUMN "maxScore",
ADD COLUMN     "additionalContentId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "explanation" TEXT;

-- AlterTable
ALTER TABLE "e_learning_courses" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" "CourseStatus" DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "e_learning_executable_codes" DROP COLUMN "text_id",
ADD COLUMN     "additional_content_id" TEXT NOT NULL,
ADD COLUMN     "expectedResult" TEXT;

-- AlterTable
ALTER TABLE "e_learning_matching_questions" DROP COLUMN "interactive_id",
ADD COLUMN     "additional_content_id" TEXT NOT NULL,
ADD COLUMN     "explanation" TEXT;

-- AlterTable
ALTER TABLE "e_learning_progress" ADD COLUMN     "lastActivityAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "e_learning_sub_chapters" ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "e_learning_text_blocks" DROP COLUMN "content",
DROP COLUMN "order",
ADD COLUMN     "orderNumber" INTEGER;

-- AlterTable
ALTER TABLE "e_learning_texts" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "e_learning_interactive_answers";

-- DropTable
DROP TABLE "e_learning_text_content_anchors";

-- DropTable
DROP TABLE "e_learning_text_interactive_attempts";

-- DropTable
DROP TABLE "e_learning_text_interactives";

-- DropTable
DROP TABLE "e_learning_videos";

-- DropEnum
DROP TYPE "ELearningAnchoredContentType";

-- DropEnum
DROP TYPE "ELearningInteractiveType";

-- CreateTable
CREATE TABLE "e_learning_content_blocks" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningHeadingContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ELearningHeadingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningParagraphContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ELearningParagraphContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningHighlightContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" VARCHAR(120) NOT NULL,

    CONSTRAINT "ELearningHighlightContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningAccordionContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ELearningAccordionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningAccordionItem" (
    "id" TEXT NOT NULL,
    "accordionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningAccordionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningCarouselContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cardsPerSlide" INTEGER,

    CONSTRAINT "ELearningCarouselContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningCarouselItem" (
    "id" TEXT NOT NULL,
    "carouselId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "content" TEXT,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningContentCardContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "disableExpandableContent" BOOLEAN NOT NULL,

    CONSTRAINT "ELearningContentCardContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningContentCardItem" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expandableContent" TEXT,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningContentCardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningTabNavigationContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ELearningTabNavigationContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningTabItem" (
    "id" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningTabItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningSummaryContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "ELearningSummaryContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELearningSummaryComment" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ELearningSummaryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_additional_contents" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "type" "AdditionalContentType" NOT NULL,
    "position" "AnchorPosition" NOT NULL,
    "orderNumber" INTEGER,

    CONSTRAINT "e_learning_additional_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_image_video_contents" (
    "id" TEXT NOT NULL,
    "additionalContentId" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_image_video_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_learning_block_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_block_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ELearningHeadingContent_contentId_key" ON "ELearningHeadingContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningParagraphContent_contentId_key" ON "ELearningParagraphContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningHighlightContent_contentId_key" ON "ELearningHighlightContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningAccordionContent_contentId_key" ON "ELearningAccordionContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningCarouselContent_contentId_key" ON "ELearningCarouselContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningContentCardContent_contentId_key" ON "ELearningContentCardContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningTabNavigationContent_contentId_key" ON "ELearningTabNavigationContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningSummaryContent_contentId_key" ON "ELearningSummaryContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_image_video_contents_additionalContentId_key" ON "e_learning_image_video_contents"("additionalContentId");

-- CreateIndex
CREATE INDEX "e_learning_block_progress_blockId_idx" ON "e_learning_block_progress"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_block_progress_userId_blockId_key" ON "e_learning_block_progress"("userId", "blockId");

-- CreateIndex
CREATE UNIQUE INDEX "ELearningMultipleChoiceQuestion_additionalContentId_key" ON "ELearningMultipleChoiceQuestion"("additionalContentId");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_courses_slug_key" ON "e_learning_courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_executable_codes_additional_content_id_key" ON "e_learning_executable_codes"("additional_content_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_matching_questions_additional_content_id_key" ON "e_learning_matching_questions"("additional_content_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_text_blocks_text_id_orderNumber_key" ON "e_learning_text_blocks"("text_id", "orderNumber");

-- CreateIndex
CREATE INDEX "e_learning_texts_sub_bab_id_idx" ON "e_learning_texts"("sub_bab_id");

-- AddForeignKey
ALTER TABLE "e_learning_content_blocks" ADD CONSTRAINT "e_learning_content_blocks_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "e_learning_text_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningHeadingContent" ADD CONSTRAINT "ELearningHeadingContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningParagraphContent" ADD CONSTRAINT "ELearningParagraphContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningHighlightContent" ADD CONSTRAINT "ELearningHighlightContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningAccordionContent" ADD CONSTRAINT "ELearningAccordionContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningAccordionItem" ADD CONSTRAINT "ELearningAccordionItem_accordionId_fkey" FOREIGN KEY ("accordionId") REFERENCES "ELearningAccordionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningCarouselContent" ADD CONSTRAINT "ELearningCarouselContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningCarouselItem" ADD CONSTRAINT "ELearningCarouselItem_carouselId_fkey" FOREIGN KEY ("carouselId") REFERENCES "ELearningCarouselContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningContentCardContent" ADD CONSTRAINT "ELearningContentCardContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningContentCardItem" ADD CONSTRAINT "ELearningContentCardItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ELearningContentCardContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningTabNavigationContent" ADD CONSTRAINT "ELearningTabNavigationContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningTabItem" ADD CONSTRAINT "ELearningTabItem_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ELearningTabNavigationContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningSummaryContent" ADD CONSTRAINT "ELearningSummaryContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningSummaryComment" ADD CONSTRAINT "ELearningSummaryComment_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "ELearningSummaryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_additional_contents" ADD CONSTRAINT "e_learning_additional_contents_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "e_learning_text_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_matching_questions" ADD CONSTRAINT "e_learning_matching_questions_additional_content_id_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "e_learning_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELearningMultipleChoiceQuestion" ADD CONSTRAINT "ELearningMultipleChoiceQuestion_additionalContentId_fkey" FOREIGN KEY ("additionalContentId") REFERENCES "e_learning_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_image_video_contents" ADD CONSTRAINT "e_learning_image_video_contents_additionalContentId_fkey" FOREIGN KEY ("additionalContentId") REFERENCES "e_learning_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_executable_codes" ADD CONSTRAINT "e_learning_executable_codes_additional_content_id_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "e_learning_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_block_progress" ADD CONSTRAINT "e_learning_block_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_block_progress" ADD CONSTRAINT "e_learning_block_progress_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "e_learning_text_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
