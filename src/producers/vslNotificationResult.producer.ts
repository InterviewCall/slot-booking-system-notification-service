import logger from '../configs/logger.config';
import { VSL_NOTIFICATION_RESULT_PAYLOAD } from '../constants';
import {
    VslNotificationResultDto,
    vslNotificationResultSchema,
} from '../dto/VslNotificationResult.dto';
import vslNotificationResultQueue from '../queues/vslNotificationResult.queue';

type VslNotificationResultInput = Omit<
    VslNotificationResultDto,
    'occurredAt'
>;

/**
 * Publishes a validated terminal VSL delivery result for the candidate form service.
 * A stable job ID helps prevent duplicate result jobs while an earlier job still exists.
 */
export async function publishVslNotificationResult(
    result: VslNotificationResultInput,
): Promise<void> {
    // Add the result timestamp and validate the complete payload.
    const payload = vslNotificationResultSchema.parse({
        ...result,
        occurredAt: new Date().toISOString(),
    });

    await vslNotificationResultQueue.add(
        VSL_NOTIFICATION_RESULT_PAYLOAD,
        payload,
        {
            // Use a stable job ID for each VSL step's final result.
            jobId: `vsl-result-${payload.vslStepId}`,
        },
    );

    logger.info('VSL notification result enqueued', {
        vslRunId: payload.vslRunId,
        vslStepId: payload.vslStepId,
        status: payload.status,
    });
}
