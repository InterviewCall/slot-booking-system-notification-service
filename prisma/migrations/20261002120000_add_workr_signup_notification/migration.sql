/*
  WorkR signup notifications (Day 0 email + WhatsApp) are not tied to a booking or a form submission,
  so they are identified by an external reference instead.

  - Adds the `WORKR_SIGNUP_DAY0` value to the `notification_type` enum.
  - Makes `submission_id` nullable (booking / reminder rows keep their values untouched).
  - Adds `external_ref` plus a unique index on (`external_ref`, `notification_type`), which is what makes a
    repeated job for the same WorkR user a no-op.

  Existing rows are unaffected: they all have a submission_id and get a NULL external_ref
  (NULLs never collide in a MySQL unique index).
*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `external_ref` VARCHAR(64) NULL,
    MODIFY `submission_id` CHAR(36) NULL,
    MODIFY `notification_type` ENUM('BOOKING_CONFIRMED', 'FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK', 'WORKR_SIGNUP_DAY0') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `notifications_external_ref_notification_type_key` ON `notifications`(`external_ref`, `notification_type`);
