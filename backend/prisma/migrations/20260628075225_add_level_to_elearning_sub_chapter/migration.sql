/*
  Warnings:

  - The values [QUIZ,ASSIGNMENT] on the enum `ELearningAuditEntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ELearningAuditEntityType_new" AS ENUM ('COURSE', 'SUB_CHAPTER', 'SUB_BAB', 'TEXT');
ALTER TABLE "e_learning_audit_logs" ALTER COLUMN "entity_type" TYPE "ELearningAuditEntityType_new" USING ("entity_type"::text::"ELearningAuditEntityType_new");
ALTER TYPE "ELearningAuditEntityType" RENAME TO "ELearningAuditEntityType_old";
ALTER TYPE "ELearningAuditEntityType_new" RENAME TO "ELearningAuditEntityType";
DROP TYPE "ELearningAuditEntityType_old";
COMMIT;

-- AlterTable
ALTER TABLE "e_learning_sub_chapters" ADD COLUMN     "level" VARCHAR;
