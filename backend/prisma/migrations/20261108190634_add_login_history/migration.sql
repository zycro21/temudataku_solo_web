-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('PASSWORD', 'GOOGLE');

-- CreateEnum
CREATE TYPE "LoginPortal" AS ENUM ('WEB', 'AFFILIATOR');

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "method" "LoginMethod" NOT NULL,
    "portal" "LoginPortal" NOT NULL DEFAULT 'WEB',
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "logged_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_history_user_id_logged_in_at_idx" ON "login_history"("user_id", "logged_in_at");

-- CreateIndex
CREATE INDEX "login_history_logged_in_at_idx" ON "login_history"("logged_in_at");

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
