import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';

export type BookingReminderNotificationDto = {
    candidateId: number;
    submissionId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    bookingLink: string;
    subject: string;
    channels: NotificationChannel[];
    templateKeys: Record<NotificationChannel, string>;
};
