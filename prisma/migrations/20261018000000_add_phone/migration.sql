-- AlterTable
ALTER TABLE "app_users" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "app_users_phone_key" ON "app_users"("phone");
