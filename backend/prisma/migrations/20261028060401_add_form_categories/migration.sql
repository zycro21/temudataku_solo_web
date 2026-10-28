-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "form_categories" (
    "id" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "form_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_categories_type_idx" ON "form_categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "form_categories_type_name_key" ON "form_categories"("type", "name");

-- CreateIndex
CREATE INDEX "forms_category_id_idx" ON "forms"("category_id");

-- AddForeignKey
ALTER TABLE "form_categories" ADD CONSTRAINT "form_categories_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "form_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
