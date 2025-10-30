-- DropForeignKey
ALTER TABLE "user_activity_logs" DROP CONSTRAINT "user_activity_logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
