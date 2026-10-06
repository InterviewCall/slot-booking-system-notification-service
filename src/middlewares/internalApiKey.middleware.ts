import { NextFunction, Request, Response } from 'express';

import { internalApiConfig } from '../configs/server.config';
import { InternalServerError, UnauthorizedError } from '../utils/errors/app.error';
import { safeCompareSecrets } from '../utils/helpers/safeCompareSecrets.helper';

// Guards every service-to-service endpoint: the caller must send the shared secret in the configured header.
export function validateInternalApiKey(req: Request, _res: Response, next: NextFunction) {
    try {
        const { INTERNAL_API_KEY, INTERNAL_API_KEY_HEADER } = internalApiConfig;
        const providedKey = req.header(INTERNAL_API_KEY_HEADER);

        if(!INTERNAL_API_KEY) {
            throw new InternalServerError('SCHEDULER_INTERNAL_API_KEY is not configured');
        }

        if(!providedKey || !safeCompareSecrets(providedKey, INTERNAL_API_KEY)) {
            throw new UnauthorizedError('Unauthorized internal service request');
        }

        next();
    } catch (error) {
        next(error);
    }
}
