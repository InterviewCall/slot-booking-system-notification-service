import { Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { TRANSACTIONAL_NOTIFICATION_PAYLOAD, TRANSACTIONAL_NOTIFICATION_QUEUE } from '../constants';
import { BookingNotificationDto } from '../dto/BookingNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import TransactionalNotificationService from '../services/TransactionalNotification.service';
import { BadRequestError } from '../utils/errors/app.error';

export function setupTransactionalNotificationProcessor() {
    const transactionalProcessor = new Worker<BookingNotificationDto>(
        TRANSACTIONAL_NOTIFICATION_QUEUE,
        async (job) => {
            if(job.name != TRANSACTIONAL_NOTIFICATION_PAYLOAD) {
                throw new BadRequestError('Invalid job name');
            }

            const payload = job.data;

            const transactionalNotificationService = new TransactionalNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository()
            );

            await transactionalNotificationService.sendNotification(payload);

        }, {
            connection: bullMqConnection,
            concurrency: 5
        }
    );

    transactionalProcessor.on('completed', (job) =>{
        logger.info('Transactional notification job completed', {
            jobId: job.id,
            jobName: job.name
        });
    });

    transactionalProcessor.on('failed', (job, error) => {
        logger.error('Transactional notification job failed', {
            jobId: job?.id,
            jobName: job?.name,
            error,
        });
    });
}