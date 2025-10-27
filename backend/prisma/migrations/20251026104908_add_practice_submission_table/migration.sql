-- CreateTable
CREATE TABLE "practice_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "notes" TEXT,
    "files" VARCHAR[],
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT DEFAULT 'pending',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(6),

    CONSTRAINT "practice_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practice_submissions_user_id_practice_id_key" ON "practice_submissions"("user_id", "practice_id");

-- AddForeignKey
ALTER TABLE "practice_submissions" ADD CONSTRAINT "practice_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_submissions" ADD CONSTRAINT "practice_submissions_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_submissions" ADD CONSTRAINT "practice_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
