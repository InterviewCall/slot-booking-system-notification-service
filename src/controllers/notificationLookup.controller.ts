import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import NotificationLookupService from '../services/NotificationLookup.service';
import { NotificationLookupResponse } from '../types/NotificationLookup.type';
import { lookupNotificationsBodySchema } from '../validators/notificationLookup.validator';

const notificationLookupService = new NotificationLookupService(new NotificationDeliveryRepository());

export async function lookupNotificationsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { submissionIds } = lookupNotificationsBodySchema.parse(req.body);
        const deliveries = await notificationLookupService.lookupBySubmissionIds(submissionIds);
        const data: NotificationLookupResponse = { deliveries };

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notifications fetched successfully',
            data,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
