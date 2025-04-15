/*
  Warnings:

  - The primary key for the `bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `feedback` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `mentor_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `mentoring_services` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `mentoring_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practice_files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practice_materials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practice_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practice_purchases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practice_reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `practices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `referral_codes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_behavior` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_mentee_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_session_id_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_mentee_id_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_service_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_session_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_user_id_fkey";

-- DropForeignKey
ALTER TABLE "mentor_profiles" DROP CONSTRAINT "mentor_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "mentoring_services" DROP CONSTRAINT "mentoring_services_mentor_id_fkey";

-- DropForeignKey
ALTER TABLE "mentoring_sessions" DROP CONSTRAINT "mentoring_sessions_service_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_files" DROP CONSTRAINT "practice_files_material_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_materials" DROP CONSTRAINT "practice_materials_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_progress" DROP CONSTRAINT "practice_progress_material_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_progress" DROP CONSTRAINT "practice_progress_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_progress" DROP CONSTRAINT "practice_progress_user_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_referral_code_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_user_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_reviews" DROP CONSTRAINT "practice_reviews_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "practice_reviews" DROP CONSTRAINT "practice_reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "practices" DROP CONSTRAINT "practices_mentor_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_mentee_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_session_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_codes" DROP CONSTRAINT "referral_codes_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "user_behavior" DROP CONSTRAINT "user_behavior_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mentee_id" SET DATA TYPE TEXT,
ALTER COLUMN "session_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mentee_id" SET DATA TYPE TEXT,
ALTER COLUMN "service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "session_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "mentor_profiles" DROP CONSTRAINT "mentor_profiles_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "mentoring_services" DROP CONSTRAINT "mentoring_services_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mentor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "mentoring_services_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "mentoring_sessions" DROP CONSTRAINT "mentoring_sessions_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "mentoring_sessions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "booking_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practice_files" DROP CONSTRAINT "practice_files_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "material_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practice_files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practice_materials" DROP CONSTRAINT "practice_materials_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "practice_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practice_materials_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practice_progress" DROP CONSTRAINT "practice_progress_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "practice_id" SET DATA TYPE TEXT,
ALTER COLUMN "material_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practice_progress_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practice_purchases" DROP CONSTRAINT "practice_purchases_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "practice_id" SET DATA TYPE TEXT,
ALTER COLUMN "payment_id" SET DATA TYPE TEXT,
ALTER COLUMN "referral_code_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practice_purchases_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practice_reviews" DROP CONSTRAINT "practice_reviews_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "practice_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practice_reviews_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "practices" DROP CONSTRAINT "practices_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mentor_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "practices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mentee_id" SET DATA TYPE TEXT,
ALTER COLUMN "session_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "referral_codes" DROP CONSTRAINT "referral_codes_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "owner_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_behavior" DROP CONSTRAINT "user_behavior_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_behavior_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "role_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "mentoring_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentoring_services" ADD CONSTRAINT "mentoring_services_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "mentoring_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_files" ADD CONSTRAINT "practice_files_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "practice_materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_materials" ADD CONSTRAINT "practice_materials_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_progress" ADD CONSTRAINT "practice_progress_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "practice_materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_progress" ADD CONSTRAINT "practice_progress_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_progress" ADD CONSTRAINT "practice_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_purchases" ADD CONSTRAINT "practice_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_reviews" ADD CONSTRAINT "practice_reviews_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practice_reviews" ADD CONSTRAINT "practice_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_behavior" ADD CONSTRAINT "user_behavior_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
