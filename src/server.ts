import express from 'express';

import serverAdapter from './configs/bullBoard.config';
import logger from './configs/logger.config';
import { serverConfig } from './configs/server.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import { setupTransactionalNotificationProcessor } from './processors/transactionalNotification.processor';
import { addDetailsToQueue } from './producers/transactionalNotification.producer';
import apiRouter from './routes';
import { NotificationChannel } from './utils/enums/NotificationChannel.enum';

const app = express();


app.use(express.json());

app.use(attachCorrelationIdMiddleware);

app.use('/api', apiRouter);
app.use('/ui/queue-dashboard', serverAdapter.getRouter());

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`For Queue Dasboard, open http://localhost:${serverConfig.PORT}/ui/queue-dashboard`);
    setupTransactionalNotificationProcessor();
    logger.info('Transactional notification processor setup completed');

    await addDetailsToQueue({
        bookingId: 1,
        submissionId: 'abc',
        candidateId: 1,
        candidateName: 'Dibyendu Shannigrahi',
        candidateEmail: 'dibyendushannigrahi@interviewcall.club',
        candidatePhone: '+917044610338',
        slotDate: '10th June 2026',
        slotTime: '5:30 PM',
        subject: 'Booking Confirmed',
        templateKeys: {
            EMAIL: 'BookingConfirmation',
            WHATSAPP: 'BookingConfirmation'
        },
        channels: [NotificationChannel.EMAIL, NotificationChannel.WHATSAPP]
    });
});