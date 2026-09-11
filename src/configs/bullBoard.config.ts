import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import reminderNotificationQueue from '../queues/reminderNotification.queue';
import transactionalNotificationQueue from '../queues/transactionalNotification.queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/ui/queue-dashboard');

createBullBoard({
    queues: [new BullMQAdapter(transactionalNotificationQueue), new BullMQAdapter(reminderNotificationQueue)],
    serverAdapter
});

export default serverAdapter;