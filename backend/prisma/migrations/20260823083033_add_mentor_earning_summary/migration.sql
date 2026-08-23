-- CreateTable
CREATE TABLE "mentor_earning_summaries" (
    "id" TEXT NOT NULL,
    "mentor_profile_id" TEXT NOT NULL,
    "total_earnings" DECIMAL NOT NULL,
    "total_this_month" DECIMAL NOT NULL,
    "total_last_month" DECIMAL NOT NULL,
    "growth_percent" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_earning_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_earning_summaries_mentor_profile_id_key" ON "mentor_earning_summaries"("mentor_profile_id");

-- AddForeignKey
ALTER TABLE "mentor_earning_summaries" ADD CONSTRAINT "mentor_earning_summaries_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
