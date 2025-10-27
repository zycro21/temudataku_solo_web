-- AlterTable
ALTER TABLE "practice_submissions" ADD COLUMN     "kelengkapan" VARCHAR,
ADD COLUMN     "kesesuaian" VARCHAR,
ADD COLUMN     "komentar" TEXT,
ADD COLUMN     "kreativitas" VARCHAR,
ADD COLUMN     "kualitas" VARCHAR,
ADD COLUMN     "perluRevisi" BOOLEAN DEFAULT false,
ADD COLUMN     "saran" TEXT;
