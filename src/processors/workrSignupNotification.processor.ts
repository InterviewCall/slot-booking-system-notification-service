import { UnrecoverableError, Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { workerRetentionOptions } from '../configs/queueOptions.config';
import { WORKR_SIGNUP_NOTIFICATION_PAYLOAD, WORKR_SIGNUP_NOTIFICATION_QUEUE } from '../constants';
import { WorkrSignupNotificationDto, workrSignupNotificationSchema } from '../dto/WorkrSignupNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import WorkrSignupNotificationService from '../services/WorkrSignupNotification.service';

export function setupWorkrSignupNotificationProcessor() {
    const workrSignupProcessor = new Worker<WorkrSignupNotificationDto>(
        WORKR_SIGNUP_NOTIFICATION_QUEUE,
        async (job) => {
            if(job.name != WORKR_SIGNUP_NOTIFICATION_PAYLOAD) {
                // retrying cannot fix a job nobody knows how to handle
                throw new UnrecoverableError('Invalid job name');
            }

            // The payload comes from another service: never send anything based on unchecked data
            const parsed = workrSignupNotificationSchema.safeParse(job.data);

            if(!parsed.success) {
                const reasons = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
                // retrying cannot fix a malformed payload
                throw new UnrecoverableError(`Invalid WorkR signup notification payload: ${reasons}`);
            }

            const workrSignupNotificationService = new WorkrSignupNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository()
            );

            await workrSignupNotificationService.sendNotification(parsed.data);

        }, {
            connection: bullMqConnection,
            concurrency: 5,
            ...workerRetentionOptions
        }
    );

    workrSignupProcessor.on('completed', (job) => {
        logger.info('WorkR signup notification job completed', {
            jobId: job.id,
            jobName: job.name
        });
    });

    workrSignupProcessor.on('failed', (job, error) => {
        logger.error('WorkR signup notification job failed', {
            jobId: job?.id,
            jobName: job?.name,
            error,
        });
    });

    logger.info('WorkR signup notification processor setup completed');
}
