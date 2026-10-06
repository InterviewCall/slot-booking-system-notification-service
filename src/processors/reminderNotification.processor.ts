import { UnrecoverableError, Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { workerRetentionOptions } from '../configs/queueOptions.config';
import { REMINDER_NOTIFICATION_PAYLOAD, REMINDER_NOTIFICATION_QUEUE } from '../constants';
import { BookingReminderNotificationDto } from '../dtos/BookingReminderNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import ReminderNotificationService from '../services/ReminderNotification.service';

export function setupReminderNotificationProcessor() {
    const reminderProcessor = new Worker<BookingReminderNotificationDto>(
        REMINDER_NOTIFICATION_QUEUE,
        async (job) => {
            if(job.name != REMINDER_NOTIFICATION_PAYLOAD) {
                // retrying cannot fix a job nobody knows how to handle
                throw new UnrecoverableError('Invalid job name');
            }

            const payload = job.data;

            const reminderNotificationService = new ReminderNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository()
            );

            await reminderNotificationService.sendNotification(payload);

        }, {
            connection: bullMqConnection,
            concurrency: 5,
            ...workerRetentionOptions
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