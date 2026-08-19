-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArticleContentBlockType" AS ENUM ('HEADING', 'PARAGRAPH', 'ACCORDION', 'CAROUSEL', 'CONTENT_CARD', 'TAB_NAVIGATION', 'HIGHLIGHT', 'SUMMARY');

-- CreateEnum
CREATE TYPE "ArticleAdditionalContentType" AS ENUM ('IMAGE_VIDEO');

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image" TEXT,
    "category" VARCHAR,
    "tags" VARCHAR[],
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_blocks" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_content_blocks" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "type" "ArticleContentBlockType" NOT NULL,
    "orderNumber" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleHeadingContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ArticleHeadingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleParagraphContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ArticleParagraphContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleHighlightContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" VARCHAR(1250) NOT NULL,

    CONSTRAINT "ArticleHighlightContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAccordionContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ArticleAccordionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAccordionItem" (
    "id" TEXT NOT NULL,
    "accordionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ArticleAccordionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCarouselContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cardsPerSlide" INTEGER,

    CONSTRAINT "ArticleCarouselContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCarouselItem" (
    "id" TEXT NOT NULL,
    "carouselId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "content" TEXT,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ArticleCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleContentCardContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "disableExpandableContent" BOOLEAN NOT NULL,

    CONSTRAINT "ArticleContentCardContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleContentCardItem" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expandableContent" TEXT,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ArticleContentCardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTabNavigationContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ArticleTabNavigationContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTabItem" (
    "id" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ArticleTabItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSummaryContent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "ArticleSummaryContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSummaryComment" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,

    CONSTRAINT "ArticleSummaryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_additional_contents" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "type" "ArticleAdditionalContentType" NOT NULL,
    "position" "AnchorPosition" NOT NULL,
    "orderNumber" INTEGER,

    CONSTRAINT "article_additional_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_image_video_contents" (
    "id" TEXT NOT NULL,
    "additionalContentId" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "widthPercent" INTEGER DEFAULT 100,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_image_video_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "article_blocks_article_id_orderNumber_key" ON "article_blocks"("article_id", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleHeadingContent_contentId_key" ON "ArticleHeadingContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleParagraphContent_contentId_key" ON "ArticleParagraphContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleHighlightContent_contentId_key" ON "ArticleHighlightContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleAccordionContent_contentId_key" ON "ArticleAccordionContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCarouselContent_contentId_key" ON "ArticleCarouselContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleContentCardContent_contentId_key" ON "ArticleContentCardContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleTabNavigationContent_contentId_key" ON "ArticleTabNavigationContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSummaryContent_contentId_key" ON "ArticleSummaryContent"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "article_image_video_contents_additionalContentId_key" ON "article_image_video_contents"("additionalContentId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_blocks" ADD CONSTRAINT "article_blocks_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_content_blocks" ADD CONSTRAINT "article_content_blocks_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "article_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleHeadingContent" ADD CONSTRAINT "ArticleHeadingContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleParagraphContent" ADD CONSTRAINT "ArticleParagraphContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleHighlightContent" ADD CONSTRAINT "ArticleHighlightContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAccordionContent" ADD CONSTRAINT "ArticleAccordionContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAccordionItem" ADD CONSTRAINT "ArticleAccordionItem_accordionId_fkey" FOREIGN KEY ("accordionId") REFERENCES "ArticleAccordionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCarouselContent" ADD CONSTRAINT "ArticleCarouselContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCarouselItem" ADD CONSTRAINT "ArticleCarouselItem_carouselId_fkey" FOREIGN KEY ("carouselId") REFERENCES "ArticleCarouselContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleContentCardContent" ADD CONSTRAINT "ArticleContentCardContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleContentCardItem" ADD CONSTRAINT "ArticleContentCardItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ArticleContentCardContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTabNavigationContent" ADD CONSTRAINT "ArticleTabNavigationContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTabItem" ADD CONSTRAINT "ArticleTabItem_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ArticleTabNavigationContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSummaryContent" ADD CONSTRAINT "ArticleSummaryContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "article_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSummaryComment" ADD CONSTRAINT "ArticleSummaryComment_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "ArticleSummaryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_additional_contents" ADD CONSTRAINT "article_additional_contents_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "article_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_image_video_contents" ADD CONSTRAINT "article_image_video_contents_additionalContentId_fkey" FOREIGN KEY ("additionalContentId") REFERENCES "article_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
