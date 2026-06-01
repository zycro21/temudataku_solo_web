-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT,
    "company_size" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "work_type" TEXT,
    "level" TEXT,
    "experience_required" TEXT,
    "description" TEXT,
    "requirements" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_city_idx" ON "jobs"("city");

-- CreateIndex
CREATE INDEX "jobs_country_idx" ON "jobs"("country");

-- CreateIndex
CREATE INDEX "jobs_level_idx" ON "jobs"("level");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
