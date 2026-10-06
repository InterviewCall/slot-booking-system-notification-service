import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationChannel } from '../utils/enums/NotificationChannel';
import { NotificationExecutorPayload } from './NotificationPayload.type';

// What deliverToChannels needs to send one notification over its channels.
export type DeliverToChannelsParams = {
    notificationId: bigint
    channels: NotificationChannel[]
    notificationDeliveryRepository: NotificationDeliveryRepository
    buildExecutorPayload: (channel: NotificationChannel) => NotificationExecutorPayload
}
