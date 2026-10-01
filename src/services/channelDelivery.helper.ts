import { UnrecoverableError } from 'bullmq';

import { NotificationSendStatus } from '../../generated/prisma/client';
import logger from '../configs/logger.config';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { DeliveryFailedError } from '../utils/errors/deliveryFailed.error';
import { createNotificationExecutor } from '../utils/executorFactory';

type DeliverToChannelsParams = {
    notificationId: bigint
    channels: NotificationChannel[]
    notificationDeliveryRepository: NotificationDeliveryRepository
    buildExecutorPayload: (channel: NotificationChannel) => NotificationExecutorPayload
}

function getErrorMessage(error: unknown): string {
    if(error instanceof Error) {
        return error.message;
    }

    if(typeof error == 'object' && error != null && 'message' in error && typeof error.message == 'string') {
        return error.message;
    }

    return 'Unknown Reason';
}

/**
 * Sends one notification over every requested channel and is safe to run again for the same notification:
 *  - a channel that was already delivered is skipped, so a retry never sends the same message twice
 *  - every channel is attempted even if an earlier one fails
 *  - if any channel failed, an error is thrown AFTER the loop, so the queue marks the attempt as failed,
 *    retries it with backoff, and keeps the job once the attempts are exhausted
 */
export async function deliverToChannels({
    notificationId,
    channels,
    notificationDeliveryRepository,
    buildExecutorPayload
}: DeliverToChannelsParams): Promise<void> {
    const failures: string[] = [];

    for(const channel of channels) {
        const delivery = await notificationDeliveryRepository.findOrCreateDelivery(channel, notificationId);

        if(delivery.sendStatus == NotificationSendStatus.SENT) {
            // BigInt cannot be JSON-serialised by the logger, so log it as a string
            logger.info('Channel already delivered, skipping', { notificationId: notificationId.toString(), channel });
            continue;
        }

        const notificationExecutor = createNotificationExecutor(channel);

        if(notificationExecutor == null) {
            // Retrying cannot fix an unknown channel
            throw new UnrecoverableError(`Channel not found: ${channel}`);
        }

        try {
            const providerMessageId: string = await notificationExecutor.send(buildExecutorPayload(channel));

            await notificationDeliveryRepository.markDeliverySubmitted(delivery.id, providerMessageId);
        } catch (error) {
            logger.error('Failing reason', { channel, error });

            const failedReason = getErrorMessage(error);

            await notificationDeliveryRepository.markDeliveryFailed(delivery.id, failedReason);

            failures.push(`${channel}: ${failedReason}`);
        }
    }

    if(failures.length > 0) {
        throw new DeliveryFailedError(failures);
    }
}
