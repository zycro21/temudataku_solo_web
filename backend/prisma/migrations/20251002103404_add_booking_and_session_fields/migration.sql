-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "expectedOutput" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "supportDocument" TEXT;

-- AlterTable
ALTER TABLE "mentoring_sessions" ADD COLUMN     "meeting_id" VARCHAR,
ADD COLUMN     "passcode" VARCHAR;
