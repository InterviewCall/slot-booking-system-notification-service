import { NotificationChannel, NotificationSendStatus } from '../../generated/prisma/client';

// One delivery (one channel of one step) of a WorkR user, as the WorkR User-Service shows it in the admin panel.
export type WorkrLookupItem = {
    userId: number
    // 0 = Day 0 signup message, otherwise the nurture day (2, 4, 5, 7, 10, 12, 15)
    step: number
    channel: NotificationChannel
    sendStatus: NotificationSendStatus
    failedReason: string | null
    // When the provider accepted the message / when it failed. ISO strings, null if not yet.
    submittedAt: string | null
    failedAt: string | null
}

export type WorkrLookupResponse = {
    deliveries: WorkrLookupItem[]
}
