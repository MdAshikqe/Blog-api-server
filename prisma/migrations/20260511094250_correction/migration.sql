/*
  Warnings:

  - You are about to drop the column `adminId` on the `posts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_adminId_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_clientId_fkey";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "adminId";
