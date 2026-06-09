import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';

export type NotificationPayload = {
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    slotDate: string
    slotTime: string
    templateKeys: Record<NotificationChannel, string>
    subject: string
}