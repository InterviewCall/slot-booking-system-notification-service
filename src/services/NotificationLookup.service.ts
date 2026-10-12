import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationLookupItem } from '../types/NotificationLookup.type';
import { isWorkrNotificationType } from '../utils/helpers/workrNotification.helper';

class NotificationLookupService {
    constructor(private readonly notificationDeliveryRepository: NotificationDeliveryRepository) {}

    /** Every delivery of the given submissions, oldest first. WorkR notifications have no submission and never appear. */
    async lookupBySubmissionIds(submissionIds: string[]): Promise<NotificationLookupItem[]> {
        const uniqueIds = [...new Set(submissionIds)];

        if (uniqueIds.length === 0) {
            return [];
        }

        const deliveries = await this.notificationDeliveryRepository.findDeliveriesForSubmissions(uniqueIds);

        return deliveries
            // the query already filters on submissionId, this keeps the type honest and WorkR rows out
            .filter((delivery) => delivery.notification.submissionId !== null && !isWorkrNotificationType(delivery.notification.notificationType))
            .map((delivery) => ({
                id: delivery.id.toString(),
                submissionId: delivery.notification.submissionId as string,
                bookingId: delivery.notification.bookingId === null ? null : delivery.notification.bookingId.toString(),
                notificationType: delivery.notification.notificationType,
                reminderNumber: delivery.notification.reminderNumber,
                channel: delivery.channel,
                sendStatus: delivery.sendStatus,
                failedReason: delivery.failedReason
            }));
    }
}

export default NotificationLookupService;
