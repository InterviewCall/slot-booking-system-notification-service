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

    /**
     * One delivery row per (notification, channel). On a retry the existing row is returned
     * so we can see which channels were already delivered.
     */
    async findOrCreateDelivery(channel: NotificationChannel, notificationId: bigint): Promise<NotificationDelivery> {
        const where = { notificationId_channel: { notificationId, channel } };

        const existing = await prisma.notificationDelivery.findUnique({ where });

        if(existing) {
            return existing;
        }

        try {
            return await this.createDelivery(channel, notificationId);
        } catch (error) {
            const created = await prisma.notificationDelivery.findUnique({ where });

            if(created) {
                return created;
            }

            throw error;
        }
    }

    async markDeliverySubmitted(deliveryId: bigint, providerMessageId: string): Promise<void> {
        await prisma.notificationDelivery.update({
            where: {
                id: deliveryId
            },
            data: {
                providerMessageId,
                sendStatus: NotificationSendStatus.SENT,
                submittedAt: new Date(),
                // a retry may have succeeded after an earlier failure
                failedReason: null,
                failedAt: null
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