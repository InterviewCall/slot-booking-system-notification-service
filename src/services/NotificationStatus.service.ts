import NotificationRepository from '../repositories/Notification.repository';
import { NotFoundError } from '../utils/errors/app.error';

class NotificationStatusService {
    constructor(
        private readonly notificationRepository: NotificationRepository
    ) {}

    async getBookingNotificationStatus(bookingId: bigint) {
        const notification =
            await this.notificationRepository.findBookingNotification(
                bookingId
            );

        if(!notification) {
            throw new NotFoundError(
                `No notification found for booking ${bookingId.toString()}`
            );
        }

        return {
            notificationId: notification.id.toString(),
            bookingId: bookingId.toString(),
            notificationType: notification.notificationType,
            deliveries: notification.deliveries.map((delivery) => ({
                channel: delivery.channel,
                status: delivery.sendStatus,
                providerMessageId: delivery.providerMessageId,
                providerStatus: delivery.providerStatus,
                failedReason: delivery.failedReason,
                submittedAt: delivery.submittedAt
                    ? delivery.submittedAt.toISOString()
                    : null,
                failedAt: delivery.failedAt
                    ? delivery.failedAt.toISOString()
                    : null
            }))
        };
    }
}

export default NotificationStatusService;