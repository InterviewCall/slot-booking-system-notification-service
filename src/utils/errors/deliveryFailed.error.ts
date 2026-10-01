/**
 * Thrown by a notification job when at least one channel could not be delivered.
 * A real Error (unlike the AppError classes) so BullMQ records the message + stack and retries the job.
 */
export class DeliveryFailedError extends Error {
    constructor(failures: string[]) {
        super(`Delivery failed for ${failures.length} channel(s): ${failures.join(' | ')}`);
        this.name = 'DeliveryFailedError';
    }
}
