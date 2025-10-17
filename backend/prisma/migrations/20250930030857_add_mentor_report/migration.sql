-- CreateTable
CREATE TABLE "mentor_report" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "understanding" TEXT,
    "participation" TEXT,
    "challenges" TEXT,
    "commonQuestions" TEXT,
    "nextFocus" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mentor_report" ADD CONSTRAINT "mentor_report_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mentoring_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_report" ADD CONSTRAINT "mentor_report_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "mentor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
