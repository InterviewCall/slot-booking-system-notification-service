import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getStatus, sendEmail } from '../services/mailing.service';

export async function mailingHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { toEmail, subject, htmlBody, textBody } = req.body;
        const response = await sendEmail(toEmail, subject, htmlBody, textBody);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Mail sent successfully',
            data: response,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}

export async function mailingStatusHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { messageId } = req.body;
        const response = await getStatus(messageId);
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Status fetched successfully',
            data: response,
            error: {}
        });
    } catch (error) {
        next(error);
    }
}