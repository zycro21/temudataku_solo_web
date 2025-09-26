-- CreateTable
CREATE TABLE "withdrawal_methods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "withdrawal_methods" ADD CONSTRAINT "withdrawal_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
