import { Notification, NotificationChannel, NotificationDelivery } from '../../generated/prisma/client';
import { NotificationCreateInput } from '../../generated/prisma/models';

export interface INotificationRepository {
    createNotification(data: NotificationCreateInput): Promise<Notification> 
}

export interface INotificationDeliveryRepository {
    createDelivery(channel: NotificationChannel, notificationId: bigint): Promise<NotificationDelivery>
    markDeliverySubmitted(deliveryId: bigint, providerMessageId: string): Promise<void>
    markDeliveryFailed(deliveryId: bigint, failedReason: string): Promise<void>
}