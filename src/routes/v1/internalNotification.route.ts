import express from 'express';

import { lookupNotificationsHandler } from '../../controllers/notificationLookup.controller';
import { validateInternalApiKey } from '../../middlewares/internalApiKey.middleware';
import { validateRequestBody } from '../../validators';
import { lookupNotificationsBodySchema } from '../../validators/notificationLookup.validator';

const internalNotificationRouter = express.Router();

// POST /api/v1/internal/notifications/lookup
internalNotificationRouter.post(
    '/lookup',
    validateInternalApiKey,
    validateRequestBody(lookupNotificationsBodySchema),
    lookupNotificationsHandler
);

export default internalNotificationRouter;
