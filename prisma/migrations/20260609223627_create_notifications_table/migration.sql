-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `candidate_id` BIGINT NOT NULL,
    `booking_id` BIGINT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `provider_message_id` VARCHAR(191) NULL,
    `notification_type` ENUM('BOOKING_CONFIRMED', 'FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK') NOT NULL,
    `sent_status` ENUM('PROCESSING', 'SENT') NOT NULL DEFAULT 'PROCESSING',
    `provider_status` VARCHAR(191) NULL,
    `channel` ENUM('EMAIL', 'WHATSAPP') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_candidate_id_booking_id_submission_id_idx`(`candidate_id`, `booking_id`, `submission_id`),
    INDEX `notifications_candidate_id_submission_id_idx`(`candidate_id`, `submission_id`),
    INDEX `notifications_candidate_id_idx`(`candidate_id`),
    INDEX `notifications_channel_idx`(`channel`),
    INDEX `notifications_provider_message_id_idx`(`provider_message_id`),
    UNIQUE INDEX `notifications_booking_id_notification_type_channel_key`(`booking_id`, `notification_type`, `channel`),
    UNIQUE INDEX `notifications_submission_id_notification_type_channel_key`(`submission_id`, `notification_type`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
