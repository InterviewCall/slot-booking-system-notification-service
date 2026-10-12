import { NextFunction, Request, Response } from 'express';

import { workrLookupConfig } from '../configs/server.config';
import { InternalServerError, UnauthorizedError } from '../utils/errors/app.error';
import { safeCompareSecrets } from '../utils/helpers/safeCompareSecrets.helper';

// Guards the WorkR delivery lookup. Fails closed: with no WORKR_LOOKUP_API_KEY configured nobody gets in.
export function validateWorkrLookupKey(req: Request, _res: Response, next: NextFunction) {
    try {
        const { API_KEY, API_KEY_HEADER } = workrLookupConfig;
        const providedKey = req.header(API_KEY_HEADER);

        if(!API_KEY) {
            throw new InternalServerError('WORKR_LOOKUP_API_KEY is not configured');
        }

        if(!providedKey || !safeCompareSecrets(providedKey, API_KEY)) {
            throw new UnauthorizedError('Unauthorized WorkR lookup request');
        }

        next();
    } catch (error) {
        next(error);
    }
}
