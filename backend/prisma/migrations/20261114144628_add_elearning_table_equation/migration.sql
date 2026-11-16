-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentBlockType" ADD VALUE 'TABLE';
ALTER TYPE "ContentBlockType" ADD VALUE 'EQUATION';

-- CreateTable
CREATE TABLE "ct_e_learning_table_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "ct_e_learning_table_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ct_e_learning_table_columns" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,

    CONSTRAINT "ct_e_learning_table_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ct_e_learning_table_rows" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,

    CONSTRAINT "ct_e_learning_table_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ct_e_learning_table_cells" (
    "id" TEXT NOT NULL,
    "row_id" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "ct_e_learning_table_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ct_e_learning_equation_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "latex" TEXT NOT NULL,

    CONSTRAINT "ct_e_learning_equation_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ct_e_learning_table_contents_contentId_key" ON "ct_e_learning_table_contents"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "ct_e_learning_table_columns_table_id_order_number_key" ON "ct_e_learning_table_columns"("table_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "ct_e_learning_table_rows_table_id_order_number_key" ON "ct_e_learning_table_rows"("table_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "ct_e_learning_table_cells_row_id_column_id_key" ON "ct_e_learning_table_cells"("row_id", "column_id");

-- CreateIndex
CREATE UNIQUE INDEX "ct_e_learning_equation_contents_contentId_key" ON "ct_e_learning_equation_contents"("contentId");

-- AddForeignKey
ALTER TABLE "ct_e_learning_table_contents" ADD CONSTRAINT "ct_e_learning_table_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ct_e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ct_e_learning_table_columns" ADD CONSTRAINT "ct_e_learning_table_columns_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "ct_e_learning_table_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ct_e_learning_table_rows" ADD CONSTRAINT "ct_e_learning_table_rows_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "ct_e_learning_table_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ct_e_learning_table_cells" ADD CONSTRAINT "ct_e_learning_table_cells_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "ct_e_learning_table_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ct_e_learning_table_cells" ADD CONSTRAINT "ct_e_learning_table_cells_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "ct_e_learning_table_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ct_e_learning_equation_contents" ADD CONSTRAINT "ct_e_learning_equation_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ct_e_learning_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
