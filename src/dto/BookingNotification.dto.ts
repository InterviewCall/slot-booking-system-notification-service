import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { NotificationType } from '../../generated/prisma/enums';

export type BookingNotificationDto = {
    bookingId: bigint | null
    candidateId: number
    submissionId: string
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    slotDate: string
    slotTime: string
    subject: string
    channels: NotificationChannel[]
    templateKeys: Record<NotificationChannel, string>

    notificationType?: NotificationType;

}