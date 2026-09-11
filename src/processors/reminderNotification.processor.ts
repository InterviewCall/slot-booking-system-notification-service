import { Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { REMINDER_NOTIFICATION_PAYLOAD, REMINDER_NOTIFICATION_QUEUE } from '../constants';
import { BookingReminderNotificationDto } from '../dto/BookingReminderNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import ReminderNotificationService from '../services/ReminderNotification.service';
import { BadRequestError } from '../utils/errors/app.error';

export function setupReminderNotificationProcessor() {
    const reminderProcessor = new Worker<BookingReminderNotificationDto>(
        REMINDER_NOTIFICATION_QUEUE,
        async (job) => {
            if(job.name != REMINDER_NOTIFICATION_PAYLOAD) {
                throw new BadRequestError('Invalid job name');
            }

            const payload = job.data;

            const reminderNotificationService = new ReminderNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository()
            );

            await reminderNotificationService.sendNotification(payload);

        }, {
            connection: bullMqConnection,
            concurrency: 5
        }
    );

    reminderProcessor.on('completed', (job) =>{
        logger.info('Reminder notification job completed', {
            jobId: job.id,
            jobName: job.name
        });
    });

    reminderProcessor.on('failed', (job, error) => {
        logger.error('Reminder notification job failed', {
            jobId: job?.id,
            jobName: job?.name,
            error,
        });
    });
}