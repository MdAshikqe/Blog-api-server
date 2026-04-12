/*
  Warnings:

  - You are about to drop the column `userId` on the `admins` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropIndex
DROP INDEX "admins_userId_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_email_fkey" FOREIGN KEY ("email") REFERENCES "user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
