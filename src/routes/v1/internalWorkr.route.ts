import express from 'express';

import { lookupWorkrDeliveriesHandler } from '../../controllers/workrLookup.controller';
import { validateWorkrLookupKey } from '../../middlewares/workrLookupKey.middleware';
import { validateRequestBody } from '../../validators';
import { workrLookupBodySchema } from '../../validators/workrLookup.validator';

const internalWorkrRouter = express.Router();

// POST /api/v1/internal/workr/deliveries
internalWorkrRouter.post(
    '/deliveries',
    validateWorkrLookupKey,
    validateRequestBody(workrLookupBodySchema),
    lookupWorkrDeliveriesHandler
);

export default internalWorkrRouter;
