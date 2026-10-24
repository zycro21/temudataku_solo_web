-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('EVENT', 'NON_EVENT');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormResponderAccess" AS ENUM ('ANYONE_WITH_LINK', 'LOGIN_REQUIRED');

-- CreateEnum
CREATE TYPE "FormNavigationAction" AS ENUM ('NEXT', 'GO_TO_SECTION', 'SUBMIT');

-- CreateEnum
CREATE TYPE "FormItemType" AS ENUM ('SHORT_ANSWER', 'PARAGRAPH', 'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'FILE_UPLOAD', 'LINEAR_SCALE', 'RATING', 'MULTIPLE_CHOICE_GRID', 'CHECKBOX_GRID', 'DATE', 'TIME_DURATION', 'TITLE_DESCRIPTION', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "FormOptionKind" AS ENUM ('CHOICE', 'GRID_ROW', 'GRID_COLUMN');

-- CreateEnum
CREATE TYPE "FormResponseStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "slug" VARCHAR NOT NULL,
    "event_id" TEXT,
    "event_name_snapshot" VARCHAR,
    "show_on_event_page" BOOLEAN NOT NULL DEFAULT true,
    "accepting_responses" BOOLEAN NOT NULL DEFAULT true,
    "response_limit_enabled" BOOLEAN NOT NULL DEFAULT false,
    "response_limit" INTEGER,
    "period_enabled" BOOLEAN NOT NULL DEFAULT false,
    "open_at" TIMESTAMP(6),
    "close_at" TIMESTAMP(6),
    "submitted_response_count" INTEGER NOT NULL DEFAULT 0,
    "responder_access" "FormResponderAccess" NOT NULL DEFAULT 'ANYONE_WITH_LINK',
    "collect_email" BOOLEAN NOT NULL DEFAULT false,
    "limit_one_response_per_account" BOOLEAN NOT NULL DEFAULT false,
    "allow_edit_response" BOOLEAN NOT NULL DEFAULT false,
    "send_response_receipt" BOOLEAN NOT NULL DEFAULT false,
    "allow_responder_draft" BOOLEAN NOT NULL DEFAULT false,
    "shuffle_question_order" BOOLEAN NOT NULL DEFAULT false,
    "notify_on_new_response" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_message" TEXT,
    "closed_message" TEXT,
    "header_image" VARCHAR,
    "theme_color" VARCHAR,
    "background_color" VARCHAR,
    "font_preset" VARCHAR,
    "published_at" TIMESTAMP(6),
    "archived_at" TIMESTAMP(6),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_sections" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "title" VARCHAR,
    "description" TEXT,
    "order_number" INTEGER NOT NULL,
    "next_action" "FormNavigationAction" NOT NULL DEFAULT 'NEXT',
    "next_section_id" TEXT,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "form_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_items" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "type" "FormItemType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "shuffle_options" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "config" JSONB,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "form_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_options" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "kind" "FormOptionKind" NOT NULL DEFAULT 'CHOICE',
    "label" VARCHAR NOT NULL,
    "order_number" INTEGER NOT NULL,
    "branch_action" "FormNavigationAction" NOT NULL DEFAULT 'NEXT',
    "branch_section_id" TEXT,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "form_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "user_id" TEXT,
    "respondent_email" VARCHAR,
    "status" "FormResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(6),
    "edit_token" VARCHAR,
    "idempotency_key" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_answers" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_type_snapshot" "FormItemType" NOT NULL,
    "item_title_snapshot" TEXT,
    "value_text" TEXT,
    "value_number" INTEGER,
    "value_date" DATE,

    CONSTRAINT "form_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_answer_selections" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "row_option_id" TEXT,
    "option_label_snapshot" VARCHAR NOT NULL,
    "row_label_snapshot" VARCHAR,

    CONSTRAINT "form_answer_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_answer_files" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "original_name" VARCHAR NOT NULL,
    "storage_path" VARCHAR NOT NULL,
    "mime_type" VARCHAR,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_answer_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forms_slug_key" ON "forms"("slug");

-- CreateIndex
CREATE INDEX "forms_type_status_idx" ON "forms"("type", "status");

-- CreateIndex
CREATE INDEX "forms_event_id_idx" ON "forms"("event_id");

-- CreateIndex
CREATE INDEX "forms_created_by_id_idx" ON "forms"("created_by_id");

-- CreateIndex
CREATE INDEX "form_sections_form_id_order_number_idx" ON "form_sections"("form_id", "order_number");

-- CreateIndex
CREATE INDEX "form_items_form_id_idx" ON "form_items"("form_id");

-- CreateIndex
CREATE INDEX "form_items_section_id_order_number_idx" ON "form_items"("section_id", "order_number");

-- CreateIndex
CREATE INDEX "form_options_item_id_order_number_idx" ON "form_options"("item_id", "order_number");

-- CreateIndex
CREATE INDEX "form_options_branch_section_id_idx" ON "form_options"("branch_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_responses_edit_token_key" ON "form_responses"("edit_token");

-- CreateIndex
CREATE INDEX "form_responses_form_id_status_submitted_at_idx" ON "form_responses"("form_id", "status", "submitted_at");

-- CreateIndex
CREATE INDEX "form_responses_user_id_idx" ON "form_responses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_responses_form_id_idempotency_key_key" ON "form_responses"("form_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "form_answers_item_id_idx" ON "form_answers"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_answers_response_id_item_id_key" ON "form_answers"("response_id", "item_id");

-- CreateIndex
CREATE INDEX "form_answer_selections_answer_id_idx" ON "form_answer_selections"("answer_id");

-- CreateIndex
CREATE INDEX "form_answer_selections_option_id_idx" ON "form_answer_selections"("option_id");

-- CreateIndex
CREATE INDEX "form_answer_files_answer_id_idx" ON "form_answer_files"("answer_id");

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_sections" ADD CONSTRAINT "form_sections_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_sections" ADD CONSTRAINT "form_sections_next_section_id_fkey" FOREIGN KEY ("next_section_id") REFERENCES "form_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_items" ADD CONSTRAINT "form_items_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_items" ADD CONSTRAINT "form_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "form_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_options" ADD CONSTRAINT "form_options_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "form_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_options" ADD CONSTRAINT "form_options_branch_section_id_fkey" FOREIGN KEY ("branch_section_id") REFERENCES "form_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "form_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "form_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answer_selections" ADD CONSTRAINT "form_answer_selections_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "form_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answer_selections" ADD CONSTRAINT "form_answer_selections_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "form_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answer_selections" ADD CONSTRAINT "form_answer_selections_row_option_id_fkey" FOREIGN KEY ("row_option_id") REFERENCES "form_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answer_files" ADD CONSTRAINT "form_answer_files_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "form_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
