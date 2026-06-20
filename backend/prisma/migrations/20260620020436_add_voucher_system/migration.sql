-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('PERCENTAGE', 'FLAT');

-- CreateEnum
CREATE TYPE "VoucherProductScope" AS ENUM ('GLOBAL', 'ELEARNING', 'PRACTICE', 'MENTORING', 'AYCL');

-- CreateEnum
CREATE TYPE "VoucherUsageStatus" AS ENUM ('RESERVED', 'USED', 'CANCELLED');

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "code" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "discountType" "VoucherDiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "max_discount_amount" DECIMAL(10,2),
    "minimum_purchase" DECIMAL(10,2),
    "product_scope" "VoucherProductScope" NOT NULL DEFAULT 'GLOBAL',
    "usage_limit" INTEGER,
    "usage_limit_per_user" INTEGER NOT NULL DEFAULT 1,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_usages" (
    "id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "VoucherUsageStatus" NOT NULL DEFAULT 'RESERVED',
    "original_amount" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "final_amount" DECIMAL(10,2) NOT NULL,
    "booking_id" TEXT,
    "practice_purchase_id" TEXT,
    "e_learning_subscription_id" TEXT,
    "aycl_booking_id" TEXT,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voucher_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_code_idx" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_is_active_idx" ON "vouchers"("is_active");

-- CreateIndex
CREATE INDEX "vouchers_product_scope_idx" ON "vouchers"("product_scope");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_usages_booking_id_key" ON "voucher_usages"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_usages_practice_purchase_id_key" ON "voucher_usages"("practice_purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_usages_e_learning_subscription_id_key" ON "voucher_usages"("e_learning_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_usages_aycl_booking_id_key" ON "voucher_usages"("aycl_booking_id");

-- CreateIndex
CREATE INDEX "voucher_usages_voucher_id_idx" ON "voucher_usages"("voucher_id");

-- CreateIndex
CREATE INDEX "voucher_usages_user_id_idx" ON "voucher_usages"("user_id");

-- CreateIndex
CREATE INDEX "voucher_usages_voucher_id_user_id_idx" ON "voucher_usages"("voucher_id", "user_id");

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_practice_purchase_id_fkey" FOREIGN KEY ("practice_purchase_id") REFERENCES "practice_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_e_learning_subscription_id_fkey" FOREIGN KEY ("e_learning_subscription_id") REFERENCES "e_learning_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_usages" ADD CONSTRAINT "voucher_usages_aycl_booking_id_fkey" FOREIGN KEY ("aycl_booking_id") REFERENCES "aycl_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
