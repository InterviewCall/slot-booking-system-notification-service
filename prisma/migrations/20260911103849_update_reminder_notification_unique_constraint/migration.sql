/*
  Warnings:

  - A unique constraint covering the columns `[submission_id,notification_type,reminder_number]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `notifications_submission_id_notification_type_key` ON `notifications`;

-- CreateIndex
CREATE UNIQUE INDEX `notifications_submission_id_notification_type_reminder_numbe_key` ON `notifications`(`submission_id`, `notification_type`, `reminder_number`);
