-- CreateTable
CREATE TABLE "redeem_codes" (
    "id" TEXT NOT NULL,
    "code" VARCHAR NOT NULL,
    "plan_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "redeem_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redeem_code_usages" (
    "id" TEXT NOT NULL,
    "redeem_code_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redeem_code_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redeem_codes_code_key" ON "redeem_codes"("code");

-- CreateIndex
CREATE INDEX "redeem_codes_plan_id_idx" ON "redeem_codes"("plan_id");

-- CreateIndex
CREATE INDEX "redeem_codes_expires_at_idx" ON "redeem_codes"("expires_at");

-- CreateIndex
CREATE INDEX "redeem_codes_is_active_idx" ON "redeem_codes"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "redeem_code_usages_subscription_id_key" ON "redeem_code_usages"("subscription_id");

-- CreateIndex
CREATE INDEX "redeem_code_usages_user_id_idx" ON "redeem_code_usages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "redeem_code_usages_redeem_code_id_user_id_key" ON "redeem_code_usages"("redeem_code_id", "user_id");

-- AddForeignKey
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "e_learning_subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem_code_usages" ADD CONSTRAINT "redeem_code_usages_redeem_code_id_fkey" FOREIGN KEY ("redeem_code_id") REFERENCES "redeem_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem_code_usages" ADD CONSTRAINT "redeem_code_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem_code_usages" ADD CONSTRAINT "redeem_code_usages_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "e_learning_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
