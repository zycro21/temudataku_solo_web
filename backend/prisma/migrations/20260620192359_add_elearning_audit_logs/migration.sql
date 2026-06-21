-- CreateEnum
CREATE TYPE "ELearningAuditEntityType" AS ENUM ('COURSE', 'SUB_CHAPTER', 'SUB_BAB', 'TEXT', 'QUIZ', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "ELearningAuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE');

-- CreateTable
CREATE TABLE "e_learning_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" "ELearningAuditEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "ELearningAuditAction" NOT NULL,
    "description" VARCHAR,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_learning_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "e_learning_audit_logs_entity_type_entity_id_idx" ON "e_learning_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "e_learning_audit_logs_user_id_idx" ON "e_learning_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "e_learning_audit_logs_created_at_idx" ON "e_learning_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "e_learning_audit_logs" ADD CONSTRAINT "e_learning_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
