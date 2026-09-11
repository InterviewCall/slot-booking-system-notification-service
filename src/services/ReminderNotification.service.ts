import { NotificationDelivery } from '../../generated/prisma/client';
import { NotificationType } from '../../generated/prisma/enums';
import logger from '../configs/logger.config';
import { BookingReminderNotificationDto } from '../dto/BookingReminderNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorStrategy } from '../strategies/NotificationExecutor.strategy';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { NotFoundError } from '../utils/errors/app.error';
import { createNotificationExecutor } from '../utils/executorFactory';

class ReminderNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly notificationDeliveryRepository: NotificationDeliveryRepository
    ) {}

    async sendNotification(payload: BookingReminderNotificationDto): Promise<void> {
        const notification = await this.notificationRepository.createNotification({
            candidateId: payload.candidateId,
            submissionId: payload.submissionId,
            notificationType: NotificationType.FORM_SUBMITTED_SLOT_NOT_BOOKED_CHECK
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

export default ReminderNotificationService;