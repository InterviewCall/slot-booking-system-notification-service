import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import WorkrLookupService from '../services/WorkrLookup.service';
import { WorkrLookupResponse } from '../types/WorkrLookup.type';
import { workrLookupBodySchema } from '../validators/workrLookup.validator';

const workrLookupService = new WorkrLookupService(new NotificationDeliveryRepository());

export async function lookupWorkrDeliveriesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userIds } = workrLookupBodySchema.parse(req.body);
        const deliveries = await workrLookupService.lookupByUserIds(userIds);
        const data: WorkrLookupResponse = { deliveries };

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'WorkR deliveries fetched successfully',
            data,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}
