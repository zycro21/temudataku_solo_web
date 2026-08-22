-- CreateTable
CREATE TABLE "e_learning_course_stream_counts" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stream_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "e_learning_course_stream_counts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "e_learning_course_stream_counts_course_id_idx" ON "e_learning_course_stream_counts"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_learning_course_stream_counts_course_id_user_id_key" ON "e_learning_course_stream_counts"("course_id", "user_id");

-- AddForeignKey
ALTER TABLE "e_learning_course_stream_counts" ADD CONSTRAINT "e_learning_course_stream_counts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "e_learning_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_learning_course_stream_counts" ADD CONSTRAINT "e_learning_course_stream_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
