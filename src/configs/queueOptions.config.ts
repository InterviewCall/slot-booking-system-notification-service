import { JobsOptions, WorkerOptions } from 'bullmq';

import { queueConfig } from './server.config';

const SECONDS_IN_A_DAY = 24 * 60 * 60;

const failedJobRetention = {
    age: queueConfig.FAILED_JOB_RETENTION_DAYS * SECONDS_IN_A_DAY,
    count: queueConfig.FAILED_JOB_RETENTION_COUNT
};

/**
 * Applied to every job added through our Queue instances.
 * Delivered jobs are removed immediately; failed jobs are retried and then kept for inspection.
 */
export const defaultJobOptions: JobsOptions = {
    attempts: queueConfig.JOB_ATTEMPTS,
    backoff: {
        type: 'exponential',
        delay: queueConfig.RETRY_BACKOFF_MS
    },
    removeOnComplete: true,
    removeOnFail: failedJobRetention
};

/**
 * Same retention rules on the consumer side. A job's own options win, so this is the safety net for
 * jobs that other services enqueue without setting removeOnComplete / removeOnFail.
 */
export const workerRetentionOptions: Pick<WorkerOptions, 'removeOnComplete' | 'removeOnFail'> = {
    removeOnComplete: { count: 0 },
    removeOnFail: failedJobRetention
};
