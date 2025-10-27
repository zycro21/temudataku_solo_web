-- CreateTable
CREATE TABLE "short_links" (
    "id" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "original_url" VARCHAR NOT NULL,
    "created_by_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");

-- AddForeignKey
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
