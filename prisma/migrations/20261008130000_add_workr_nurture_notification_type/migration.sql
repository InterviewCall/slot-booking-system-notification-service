/*
  WorkR nurture notifications (Day 2 .. Day 15 email / WhatsApp) are keyed by the WorkR user AND the nurture day.

  - Adds the `WORKR_NURTURE` value to the `notification_type` enum (the day number is stored in `reminder_number`).
  - Replaces the unique index on (`external_ref`, `notification_type`) with one that also includes `reminder_number`,
    so one WorkR user can have one notification per nurture day while a repeated job for the same day is still a no-op.

  Existing rows are unaffected: WorkR Day 0 rows have reminder_number 0, and booking / reminder rows have a NULL
  external_ref (NULLs never collide in a MySQL unique index).
*/
-- DropIndex
DROP INDEX `notifications_external_ref_notification_type_key` ON `notifications`;

-- AlterTable
ALTER TABLE `notifications` MODIFY `notification_type` ENUM('BOOKING_CONFIRMED', 'FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK', 'WORKR_SIGNUP_DAY0', 'WORKR_NURTURE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `notifications_external_ref_type_reminder_key` ON `notifications`(`external_ref`, `notification_type`, `reminder_number`);
