-- CreateEnum
CREATE TYPE "FormEventMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "event_category_label" VARCHAR(80),
ADD COLUMN     "event_description" TEXT,
ADD COLUMN     "event_end_at" TIMESTAMP(6),
ADD COLUMN     "event_faqs" JSONB,
ADD COLUMN     "event_location" VARCHAR(255),
ADD COLUMN     "event_mode" "FormEventMode",
ADD COLUMN     "event_organizer" VARCHAR(150),
ADD COLUMN     "event_start_at" TIMESTAMP(6),
ADD COLUMN     "event_timeline" JSONB,
ADD COLUMN     "event_title" VARCHAR(200);
