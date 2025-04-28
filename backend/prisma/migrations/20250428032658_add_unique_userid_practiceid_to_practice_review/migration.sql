/*
  Warnings:

  - A unique constraint covering the columns `[user_id,practice_id]` on the table `practice_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "practice_reviews_user_id_practice_id_key" ON "practice_reviews"("user_id", "practice_id");
