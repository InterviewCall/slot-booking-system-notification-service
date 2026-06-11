import { Notification } from '../../generated/prisma/client';
import { NotificationCreateInput } from '../../generated/prisma/models';
import { prisma } from '../configs/db.config';
import { INotificationRepository } from '../interfaces/INotificationRepository.interface';

class NotificationRepository implements INotificationRepository {
    async createNotification(data: NotificationCreateInput): Promise<Notification> {
        const notification = await prisma.notification.create({ data });
        return notification;
    }
}

export default NotificationRepository;