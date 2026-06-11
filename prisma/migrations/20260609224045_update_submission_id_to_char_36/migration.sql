/*
  Warnings:

  - You are about to alter the column `submission_id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.

*/
-- AlterTable
ALTER TABLE `notifications` MODIFY `submission_id` CHAR(36) NOT NULL;
