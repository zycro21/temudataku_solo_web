-- AlterTable
ALTER TABLE "commission_payments" ADD COLUMN     "withdrawal_method_id" TEXT;

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_withdrawal_method_id_fkey" FOREIGN KEY ("withdrawal_method_id") REFERENCES "withdrawal_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
