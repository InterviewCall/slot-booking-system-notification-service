import { Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { TRANSACTIONAL_NOTIFICATION_PAYLOAD, TRANSACTIONAL_NOTIFICATION_QUEUE } from '../constants';
import { BookingNotificationDto } from '../dto/BookingNotification.dto';
import { NotificationPayload } from '../types/NotificationPayload.type';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';
import { createNotificationExecutor } from '../utils/executorFactory';

export function setupTransactionalNotificationProcessor() {
    const transactionalProcessor = new Worker<BookingNotificationDto>(
        TRANSACTIONAL_NOTIFICATION_QUEUE,
        async (job) => {
            if(job.name != TRANSACTIONAL_NOTIFICATION_PAYLOAD) {
                throw new BadRequestError('Invalid job name');
            }

            const payload = job.data;

            const notificationPayload: NotificationPayload = {
                candidateName: payload.candidateName,
                candidateEmail: payload.candidateEmail,
                candidatePhone: payload.candidatePhone,
                slotDate: payload.slotDate,
                slotTime: payload.slotTime,
                subject: payload.subject,
                templateKeys: payload.templateKeys
            };

            for(const channel of payload.channels) {
                const strategy = createNotificationExecutor(channel);
                
                if(strategy == null) {
                    throw new NotFoundError(`Channel not found: ${channel}`);
                }

                const providerMessageId: string = await strategy.send(notificationPayload);

                logger.info('Notification sent successfully', {
                    jobId: job.id,
                    channel,
                    providerMessageId,
                    candidateId: payload.candidateId,
                    bookingId: payload.bookingId,
                });
            }
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