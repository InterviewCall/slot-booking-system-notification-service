/*
  Warnings:

  - You are about to drop the column `channel` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `failedReason` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `provider_message_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `provider_status` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `sent_status` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `notifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[booking_id,notification_type]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[submission_id,notification_type]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `notifications_booking_id_notification_type_channel_key` ON `notifications`;

-- DropIndex
DROP INDEX `notifications_channel_idx` ON `notifications`;

-- DropIndex
DROP INDEX `notifications_provider_message_id_idx` ON `notifications`;

-- DropIndex
DROP INDEX `notifications_submission_id_notification_type_channel_key` ON `notifications`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `channel`,
    DROP COLUMN `created_at`,
    DROP COLUMN `failedReason`,
    DROP COLUMN `provider_message_id`,
    DROP COLUMN `provider_status`,
    DROP COLUMN `sent_status`,
    DROP COLUMN `updated_at`;

-- CreateTable
CREATE TABLE `notification_deliveries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `notification_id` BIGINT NOT NULL,
    `channel` ENUM('EMAIL', 'WHATSAPP') NOT NULL,
    `provider_message_id` VARCHAR(191) NULL,
    `sent_status` ENUM('PROCESSING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `provider_status` VARCHAR(191) NULL,
    `failed_reason` TEXT NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_deliveries_channel_idx`(`channel`),
    INDEX `notification_deliveries_sent_status_idx`(`sent_status`),
    INDEX `notification_deliveries_provider_status_idx`(`provider_status`),
    INDEX `notification_deliveries_provider_message_id_idx`(`provider_message_id`),
    UNIQUE INDEX `notification_deliveries_notification_id_channel_key`(`notification_id`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `notifications_booking_id_notification_type_key` ON `notifications`(`booking_id`, `notification_type`);

-- CreateIndex
CREATE UNIQUE INDEX `notifications_submission_id_notification_type_key` ON `notifications`(`submission_id`, `notification_type`);

-- AddForeignKey
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
