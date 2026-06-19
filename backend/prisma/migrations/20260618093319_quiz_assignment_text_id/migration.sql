-- DropForeignKey
ALTER TABLE "e_learning_assignments" DROP CONSTRAINT "e_learning_assignments_text_id_fkey";

-- AddForeignKey
ALTER TABLE "e_learning_assignments" ADD CONSTRAINT "e_learning_assignments_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "e_learning_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
