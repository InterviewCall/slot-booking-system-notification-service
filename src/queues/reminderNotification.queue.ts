import { Queue } from 'bullmq';

import { bullMqConnection } from '../configs/bullMq.config';
import { defaultJobOptions } from '../configs/queueOptions.config';
import { REMINDER_NOTIFICATION_QUEUE  } from '../constants';
import { BookingReminderNotificationDto } from '../dto/BookingReminderNotification.dto';

const reminderNotificationQueue = new Queue<BookingReminderNotificationDto>(
    REMINDER_NOTIFICATION_QUEUE,
    {
        connection: bullMqConnection,

        defaultJobOptions
    }
);

export default reminderNotificationQueue;