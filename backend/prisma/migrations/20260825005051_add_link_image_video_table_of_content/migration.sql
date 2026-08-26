-- AlterTable
ALTER TABLE "article_link_contents" ADD COLUMN     "target_additional_content_id" TEXT;

-- AlterTable
ALTER TABLE "article_table_of_content_items" ADD COLUMN     "target_additional_content_id" TEXT,
ALTER COLUMN "target_content_block_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "article_link_contents" ADD CONSTRAINT "article_link_contents_target_additional_content_id_fkey" FOREIGN KEY ("target_additional_content_id") REFERENCES "article_additional_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_table_of_content_items" ADD CONSTRAINT "article_table_of_content_items_target_additional_content_i_fkey" FOREIGN KEY ("target_additional_content_id") REFERENCES "article_additional_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
