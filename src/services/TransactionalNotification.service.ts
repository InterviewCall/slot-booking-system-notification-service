import { Notification } from '../../generated/prisma/client';
import { NotificationType } from '../../generated/prisma/enums';
import { BookingNotificationDto } from '../dto/BookingNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { deliverToChannels } from './channelDelivery.helper';

class TransactionalNotificationService {
    private readonly notificationRepository: NotificationRepository;
    private readonly notificationDeliveryRepository: NotificationDeliveryRepository;

    constructor(notificationRepository: NotificationRepository, notificationDeliveryRepository: NotificationDeliveryRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationDeliveryRepository = notificationDeliveryRepository;
    }

    // Safe to run again for the same booking: resumes the existing notification and only
    // sends the channels that have not been delivered yet. Throws if any channel failed.
    async sendNotification(payload: BookingNotificationDto): Promise<void> {
        const notification: Notification = await this.notificationRepository.findOrCreateNotification({
            candidateId: payload.candidateId,
            bookingId: payload.bookingId,
            submissionId: payload.submissionId,
            notificationType: NotificationType.BOOKING_CONFIRMED
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
                            slotDate: payload.slotDate,
                            slotTime: payload.slotTime
                        }
                    }
                    : {
                        whatsAppParams: [
                            payload.candidateName,
                            payload.slotDate,
                            payload.slotTime
                        ]
                    }
                )
            })
        });
    }
}

export default TransactionalNotificationService;
