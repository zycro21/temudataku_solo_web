/*
  Warnings:

  - The values [ACCORDION,CAROUSEL,CONTENT_CARD,TAB_NAVIGATION,SUMMARY] on the enum `ArticleContentBlockType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ArticleAccordionContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleAccordionItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleCarouselContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleCarouselItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleContentCardContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleContentCardItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleSummaryComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleSummaryContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleTabItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArticleTabNavigationContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ArticleDividerStyle" AS ENUM ('SOLID', 'DASHED');

-- CreateEnum
CREATE TYPE "ArticleLinkType" AS ENUM ('EXTERNAL_URL', 'ARTICLE_SECTION');

-- AlterEnum
BEGIN;
CREATE TYPE "ArticleContentBlockType_new" AS ENUM ('HEADING', 'PARAGRAPH', 'HIGHLIGHT', 'TABLE', 'DIVIDER', 'LINK', 'TABLE_OF_CONTENT');
ALTER TABLE "article_content_blocks" ALTER COLUMN "type" TYPE "ArticleContentBlockType_new" USING ("type"::text::"ArticleContentBlockType_new");
ALTER TYPE "ArticleContentBlockType" RENAME TO "ArticleContentBlockType_old";
ALTER TYPE "ArticleContentBlockType_new" RENAME TO "ArticleContentBlockType";
DROP TYPE "ArticleContentBlockType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ArticleAccordionContent" DROP CONSTRAINT "ArticleAccordionContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleAccordionItem" DROP CONSTRAINT "ArticleAccordionItem_accordionId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleCarouselContent" DROP CONSTRAINT "ArticleCarouselContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleCarouselItem" DROP CONSTRAINT "ArticleCarouselItem_carouselId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleContentCardContent" DROP CONSTRAINT "ArticleContentCardContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleContentCardItem" DROP CONSTRAINT "ArticleContentCardItem_cardId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleSummaryComment" DROP CONSTRAINT "ArticleSummaryComment_summaryId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleSummaryContent" DROP CONSTRAINT "ArticleSummaryContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleTabItem" DROP CONSTRAINT "ArticleTabItem_tabId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleTabNavigationContent" DROP CONSTRAINT "ArticleTabNavigationContent_contentId_fkey";

-- DropTable
DROP TABLE "ArticleAccordionContent";

-- DropTable
DROP TABLE "ArticleAccordionItem";

-- DropTable
DROP TABLE "ArticleCarouselContent";

-- DropTable
DROP TABLE "ArticleCarouselItem";

-- DropTable
DROP TABLE "ArticleContentCardContent";

-- DropTable
DROP TABLE "ArticleContentCardItem";

-- DropTable
DROP TABLE "ArticleSummaryComment";

-- DropTable
DROP TABLE "ArticleSummaryContent";

-- DropTable
DROP TABLE "ArticleTabItem";

-- DropTable
DROP TABLE "ArticleTabNavigationContent";

-- CreateTable
CREATE TABLE "article_table_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "article_table_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_table_columns" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,

    CONSTRAINT "article_table_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_table_rows" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,

    CONSTRAINT "article_table_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_table_cells" (
    "id" TEXT NOT NULL,
    "row_id" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "article_table_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_divider_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "style" "ArticleDividerStyle" NOT NULL DEFAULT 'SOLID',

    CONSTRAINT "article_divider_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_link_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "linkText" VARCHAR(150) NOT NULL,
    "linkType" "ArticleLinkType" NOT NULL,
    "externalUrl" TEXT,
    "target_content_block_id" TEXT,

    CONSTRAINT "article_link_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_table_of_content_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,

    CONSTRAINT "article_table_of_content_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_table_of_content_items" (
    "id" TEXT NOT NULL,
    "toc_id" TEXT NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "order_number" INTEGER NOT NULL,
    "target_content_block_id" TEXT NOT NULL,

    CONSTRAINT "article_table_of_content_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_table_contents_contentId_key" ON "article_table_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_columns_table_id_order_number_key" ON "article_table_columns"("table_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_rows_table_id_order_number_key" ON "article_table_rows"("table_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_cells_row_id_column_id_key" ON "article_table_cells"("row_id", "column_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_divider_contents_contentId_key" ON "article_divider_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "article_link_contents_contentId_key" ON "article_link_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_of_content_contents_contentId_key" ON "article_table_of_content_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_of_content_contents_article_id_key" ON "article_table_of_content_contents"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_table_of_content_items_toc_id_order_number_key" ON "article_table_of_content_items"("toc_id", "order_number");

-- AddForeignKey
ALTER TABLE "article_table_contents" ADD CONSTRAINT "article_table_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_columns" ADD CONSTRAINT "article_table_columns_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "article_table_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_rows" ADD CONSTRAINT "article_table_rows_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "article_table_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_cells" ADD CONSTRAINT "article_table_cells_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "article_table_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_cells" ADD CONSTRAINT "article_table_cells_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "article_table_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_divider_contents" ADD CONSTRAINT "article_divider_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_link_contents" ADD CONSTRAINT "article_link_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_link_contents" ADD CONSTRAINT "article_link_contents_target_content_block_id_fkey" FOREIGN KEY ("target_content_block_id") REFERENCES "article_content_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_of_content_contents" ADD CONSTRAINT "article_table_of_content_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_of_content_contents" ADD CONSTRAINT "article_table_of_content_contents_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_of_content_items" ADD CONSTRAINT "article_table_of_content_items_toc_id_fkey" FOREIGN KEY ("toc_id") REFERENCES "article_table_of_content_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_of_content_items" ADD CONSTRAINT "article_table_of_content_items_target_content_block_id_fkey" FOREIGN KEY ("target_content_block_id") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
