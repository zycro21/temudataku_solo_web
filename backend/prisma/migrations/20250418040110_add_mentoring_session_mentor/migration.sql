-- CreateTable
CREATE TABLE "mentoring_session_mentors" (
    "id" TEXT NOT NULL,
    "mentoring_session_id" TEXT NOT NULL,
    "mentor_profile_id" TEXT NOT NULL,

    CONSTRAINT "mentoring_session_mentors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_session_mentors_mentoring_session_id_mentor_profi_key" ON "mentoring_session_mentors"("mentoring_session_id", "mentor_profile_id");

-- AddForeignKey
ALTER TABLE "mentoring_session_mentors" ADD CONSTRAINT "mentoring_session_mentors_mentoring_session_id_fkey" FOREIGN KEY ("mentoring_session_id") REFERENCES "mentoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_session_mentors" ADD CONSTRAINT "mentoring_session_mentors_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
