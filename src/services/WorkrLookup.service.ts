import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { WorkrLookupItem } from '../types/WorkrLookup.type';

const WORKR_REF_PREFIX = 'workr-user-';

class WorkrLookupService {
    constructor(private readonly notificationDeliveryRepository: NotificationDeliveryRepository) {}

    /** Every delivery of the given WorkR users, oldest first. */
    async lookupByUserIds(userIds: number[]): Promise<WorkrLookupItem[]> {
        const uniqueIds = [...new Set(userIds)];

        if (uniqueIds.length === 0) {
            return [];
        }

        const deliveries = await this.notificationDeliveryRepository.findDeliveriesForWorkrRefs(
            uniqueIds.map((id) => `${WORKR_REF_PREFIX}${id}`)
        );

        const items: WorkrLookupItem[] = [];

        for (const delivery of deliveries) {
            const ref = delivery.notification.externalRef;
            const userId = ref && ref.startsWith(WORKR_REF_PREFIX) ? Number(ref.slice(WORKR_REF_PREFIX.length)) : NaN;

            if (!Number.isInteger(userId)) {
                continue;
            }

            items.push({
                userId,
                step: delivery.notification.reminderNumber,
                channel: delivery.channel,
                sendStatus: delivery.sendStatus,
                failedReason: delivery.failedReason,
                submittedAt: delivery.submittedAt ? delivery.submittedAt.toISOString() : null,
                failedAt: delivery.failedAt ? delivery.failedAt.toISOString() : null
            });
        }

        return items;
    }
}

export default WorkrLookupService;
