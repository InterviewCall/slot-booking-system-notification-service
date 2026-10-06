import { NotificationChannel, NotificationSendStatus, NotificationType } from '../../generated/prisma/client';

// One delivery (one channel of one notification) as the booking and form services see it.
export type NotificationLookupItem = {
    id: string
    submissionId: string
    // The booking the notification belongs to (booking confirmations); null for reminders sent before any booking exists.
    bookingId: string | null
    // Raw type. The caller maps FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK to a "reminder" for the admin panel.
    notificationType: NotificationType
    reminderNumber: number
    channel: NotificationChannel
    sendStatus: NotificationSendStatus
    failedReason: string | null
}

export type NotificationLookupResponse = {
    deliveries: NotificationLookupItem[]
}
