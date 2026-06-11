import { Notification, NotificationDelivery } from '../../generated/prisma/client';
import { NotificationType } from '../../generated/prisma/enums';
import logger from '../configs/logger.config';
import { BookingNotificationDto } from '../dto/BookingNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorStrategy } from '../strategies/NotificationExecutor.strategy';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { NotFoundError } from '../utils/errors/app.error';
import { createNotificationExecutor } from '../utils/executorFactory';

class TransactionalNotificationService {
    private readonly notificationRepository: NotificationRepository;
    private readonly notificationDeliveryRepository: NotificationDeliveryRepository;

    constructor(notificationRepository: NotificationRepository, notificationDeliveryRepository: NotificationDeliveryRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationDeliveryRepository = notificationDeliveryRepository;
    }

    async sendNotification(payload: BookingNotificationDto): Promise<void> {
        const notification: Notification = await this.notificationRepository.createNotification({
            candidateId: payload.candidateId,
            bookingId: payload.bookingId,
            submissionId: payload.submissionId,
            notificationType: NotificationType.BOOKING_CONFIRMED
        });

        for(const channel of payload.channels) {
            const delivery: NotificationDelivery = await this.notificationDeliveryRepository.createDelivery(
                channel,
                notification.id
            );

            const notificationExecutor: NotificationExecutorStrategy | null = createNotificationExecutor(channel);
                
            if(notificationExecutor == null) {
                throw new NotFoundError(`Channel not found: ${channel}`);
            }

            const executorPayload: NotificationExecutorPayload = {
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
            };

            try {
                const providerMessageId: string = await notificationExecutor.send(executorPayload);

                await this.notificationDeliveryRepository.markDeliverySubmitted(
                    delivery.id,
                    providerMessageId
                );
            } catch (error) {
                logger.error('Failing reason', { error });

                const failedReason = error instanceof Error ? error.message : 'Unknown Reason';

                await this.notificationDeliveryRepository.markDeliveryFailed(
                    delivery.id,
                    failedReason
                );
            }
        }
    }
}

export default TransactionalNotificationService;