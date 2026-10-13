import { UnrecoverableError, Worker } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import logger from '../configs/logger.config';
import { workerRetentionOptions } from '../configs/queueOptions.config';
import {
    VSL_NOTIFICATION_PAYLOAD,
    VSL_NOTIFICATION_QUEUE,
} from '../constants';
import {
    VslNotificationDto,
    vslNotificationSchema,
} from '../dto/VslNotification.dto';
import { publishVslNotificationResult } from '../producers/vslNotificationResult.producer';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import VslNotificationService from '../services/VslNotification.service';

/**
 * Returns a safe, length-limited error message for the result payload.
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message.slice(0, 500) || 'Unknown notification error';
    }

    return String(error).slice(0, 500) || 'Unknown notification error';
}

/**
 * Registers the VSL notification worker.
 * It validates each job, invokes the notification service, and publishes a terminal
 * result so the candidate form service can update its VSL step.
 */
export function setupVslNotificationProcessor(): void {
    const vslProcessor = new Worker<VslNotificationDto>(
        VSL_NOTIFICATION_QUEUE,
        async (job) => {
            // Retrying cannot fix an unknown job name.
            if (job.name !== VSL_NOTIFICATION_PAYLOAD) {
                throw new UnrecoverableError(
                    'Invalid VSL notification job name',
                );
            }

            // Validate the cross-service payload before attempting delivery.
            const parsed = vslNotificationSchema.safeParse(job.data);

            if (!parsed.success) {
                const reasons = parsed.error.issues
                    .map(
                        (issue) =>
                            `${issue.path.join('.')}: ${issue.message}`,
                    )
                    .join('; ');

                throw new UnrecoverableError(
                    `Invalid VSL notification payload: ${reasons}`,
                );
            }

            const payload = parsed.data;

            const vslNotificationService = new VslNotificationService(
                new NotificationRepository(),
                new NotificationDeliveryRepository(),
            );

            try {
                // Sends the VSL email using the existing delivery helper.
                await vslNotificationService.sendNotification(payload);
            } catch (error: unknown) {
                const configuredAttempts = job.opts.attempts;

                const maxAttempts =
                    typeof configuredAttempts === 'number' &&
                    configuredAttempts > 0
                        ? configuredAttempts
                        : 1;

                // Publish a final failure only for a permanent error
                // or after all configured attempts have been exhausted.
                const isTerminal =
                    error instanceof UnrecoverableError ||
                    job.attemptsMade + 1 >= maxAttempts;

                if (isTerminal) {
                    await publishVslNotificationResult({
                        vslRunId: payload.vslRunId,
                        vslStepId: payload.vslStepId,
                        submissionId: payload.submissionId,
                        status: 'FAILED',
                        errorMessage: getErrorMessage(error),
                    });
                }

                // BullMQ handles retry timing using the queue's configured policy.
                throw error;
            }

            // Report success to the candidate form service.
            await publishVslNotificationResult({
                vslRunId: payload.vslRunId,
                vslStepId: payload.vslStepId,
                submissionId: payload.submissionId,
                status: 'SENT',
            });
        },
        {
            connection: bullMqConnection,
            concurrency: 5,
            ...workerRetentionOptions,
        },
    );

    vslProcessor.on('completed', (job) => {
        logger.info('VSL notification job completed', {
            jobId: job.id,
            jobName: job.name,
        });
    });

    vslProcessor.on('failed', (job, error) => {
        logger.error('VSL notification job failed', {
            jobId: job?.id,
            jobName: job?.name,
            attemptsMade: job?.attemptsMade,
            error,
        });
    });

    logger.info('VSL notification processor setup completed');
}
