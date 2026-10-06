import { NotificationChannel } from '../utils/enums/NotificationChannel';

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

export type EmailSender = {
    fromEmail: string
    fromName: string
    replyTo: string
}

export type NotificationExecutorPayload = {
    recipient: string
    candidateName: string
    subject: string
    templateKey: string
    emailParams?: Record<string, string>
    whatsAppParams?: string[]
    // Overrides the default SES sender for this one email
    emailSender?: EmailSender
}