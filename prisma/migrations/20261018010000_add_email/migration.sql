-- AlterTable
ALTER TABLE "app_users" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");
