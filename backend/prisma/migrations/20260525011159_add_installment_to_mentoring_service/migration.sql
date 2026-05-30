-- AlterTable
ALTER TABLE "mentoring_services" ADD COLUMN     "installment_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_installment_months" INTEGER;
