import { Queue } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import { defaultJobOptions } from '../configs/queueOptions.config';
import { WORKR_SIGNUP_NOTIFICATION_QUEUE } from '../constants';
import { WorkrSignupNotificationDto } from '../dtos/WorkrSignupNotification.dto';

// The producer is WorkR's User-Service (it adds jobs straight to Redis). This instance exists so the
// queue shows up in Bull Board and so jobs can be added from this service if ever needed.
const workrSignupNotificationQueue = new Queue<WorkrSignupNotificationDto>(
    WORKR_SIGNUP_NOTIFICATION_QUEUE,
    {
        connection: bullMqConnection,

        defaultJobOptions
    }
);

export default workrSignupNotificationQueue;
