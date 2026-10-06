import { NotificationType } from '../../generated/prisma/enums';
import { BookingReminderNotificationDto } from '../dtos/BookingReminderNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel';
import { deliverToChannels } from '../utils/helpers/channelDelivery.helper';

class ReminderNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly notificationDeliveryRepository: NotificationDeliveryRepository
    ) {}

    // Safe to run again for the same reminder: resumes the existing notification and only
    // sends the channels that have not been delivered yet. Throws if any channel failed.
    async sendNotification(payload: BookingReminderNotificationDto): Promise<void> {
        const notification = await this.notificationRepository.findOrCreateNotification({
            candidateId: payload.candidateId,
            submissionId: payload.submissionId,
            reminderNumber: payload.reminderNumber,
            notificationType: NotificationType.FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK
        });

        await deliverToChannels({
            notificationId: notification.id,
            channels: payload.channels,
            notificationDeliveryRepository: this.notificationDeliveryRepository,
            buildExecutorPayload: (channel: NotificationChannel): NotificationExecutorPayload => ({
                recipient: channel == NotificationChannel.EMAIL ? payload.candidateEmail : payload.candidatePhone,
                candidateName: payload.candidateName,
                subject: payload.subject,
                templateKey: payload.templateKeys[channel],

                ...(channel == NotificationChannel.EMAIL
                    ? {
                        emailParams: {
                            candidateName: payload.candidateName,
                            bookingLink: payload.bookingLink
                        }
                    }
                    : {
                        whatsAppParams: [
                            payload.candidateName,
                            payload.bookingLink
                        ]
                    }
                )
            })
        });
    }
}

export default ReminderNotificationService;
