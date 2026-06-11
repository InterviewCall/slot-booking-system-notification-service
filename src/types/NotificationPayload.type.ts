import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';

export type TransactionalNotificationPayload = {
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    slotDate: string
    slotTime: string
    templateKeys: Record<NotificationChannel, string>
    subject: string
}

export type ReminderNotificationPayload = {
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    subject: string
    submissionId: string
    formSlug: string
    submittedAt: string
    templateKeys: Record<NotificationChannel, string>
}

export type NotificationExecutorPayload = {
    recipient: string
    candidateName: string
    subject: string
    templateKey: string
    emailParams?: Record<string, string>
    whatsAppParams?: string[]
}