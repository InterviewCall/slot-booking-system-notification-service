-- AlterTable
ALTER TABLE `notification_deliveries` ADD COLUMN `failed_at` DATETIME(3) NULL,
    MODIFY `failed_reason` TEXT NULL,
    MODIFY `submitted_at` DATETIME(3) NULL;
