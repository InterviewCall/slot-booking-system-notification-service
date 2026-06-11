import { NotificationChannel, NotificationDelivery, NotificationSendStatus } from '../../generated/prisma/client';
import { prisma } from '../configs/db.config';
import { INotificationDeliveryRepository } from '../interfaces/INotificationRepository.interface';

class NotificationDeliveryRepository implements INotificationDeliveryRepository {
    async createDelivery(channel: NotificationChannel, notificationId: bigint): Promise<NotificationDelivery> {
        const delivery = await prisma.notificationDelivery.create({
            data: {
                channel,
                notification: {
                    connect: {
                        id: notificationId
                    }
                }
            }
        });
        return delivery;
    }

    async markDeliverySubmitted(deliveryId: bigint, providerMessageId: string): Promise<void> {
        await prisma.notificationDelivery.update({
            where: {
                id: deliveryId
            },
            data: {
                providerMessageId,
                sendStatus: NotificationSendStatus.SENT,
                submittedAt: new Date()
            }
        });
    }

    async markDeliveryFailed(deliveryId: bigint, failedReason: string): Promise<void> {
        await prisma.notificationDelivery.update({
            where: {
                id: deliveryId
            },
            data: {
                failedReason,
                sendStatus: NotificationSendStatus.FAILED,
                failedAt: new Date()
            }
        });
    }
}

export default NotificationDeliveryRepository;