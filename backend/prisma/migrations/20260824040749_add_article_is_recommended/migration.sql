-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "is_recommended" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "articles_is_recommended_idx" ON "articles"("is_recommended");
