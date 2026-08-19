-- CreateTable
CREATE TABLE "redeem_code_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redeem_code_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "redeem_code_attempts_user_id_success_created_at_idx" ON "redeem_code_attempts"("user_id", "success", "created_at");

-- AddForeignKey
ALTER TABLE "redeem_code_attempts" ADD CONSTRAINT "redeem_code_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
