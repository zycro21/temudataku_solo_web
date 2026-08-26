-- CreateEnum
CREATE TYPE "ArticleElementType" AS ENUM ('HEADING', 'PARAGRAPH', 'IMAGE', 'VIDEO', 'TABLE', 'HIGHLIGHT', 'DIVIDER', 'LINK', 'TABLE_OF_CONTENT');

-- CreateTable
CREATE TABLE "article_element_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "element_type" "ArticleElementType" NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_element_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_element_favorites_user_id_element_type_key" ON "article_element_favorites"("user_id", "element_type");

-- AddForeignKey
ALTER TABLE "article_element_favorites" ADD CONSTRAINT "article_element_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
