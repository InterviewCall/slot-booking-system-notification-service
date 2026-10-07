import { Router } from 'express';

import {
    getBookingNotificationStatusHandler,
} from '../../controllers/notification.controller';
import { validateRequestParams } from '../../validators';
import { getBookingNotificationStatusSchema } from '../../validators/notification.validator';

const notificationRouter = Router();

notificationRouter.get(
    '/bookings/:bookingId',
    validateRequestParams(getBookingNotificationStatusSchema),
    getBookingNotificationStatusHandler
);

export default notificationRouter;