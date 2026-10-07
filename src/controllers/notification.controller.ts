import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import NotificationRepository from '../repositories/Notification.repository';
import NotificationStatusService from '../services/NotificationStatus.service';


const notificationStatusService = new NotificationStatusService(
    new NotificationRepository()
);

export async function getBookingNotificationStatusHandler(req: Request,res: Response,next: NextFunction) {
    try {
        const bookingId = (req.params as unknown as {
            bookingId: bigint;
        }).bookingId;

        const response =
            await notificationStatusService.getBookingNotificationStatus(
                bookingId
            );

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notification status fetched successfully',
            data: response,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}