import { z } from 'zod';

export const getBookingNotificationStatusSchema = z.object({
    bookingId: z
        .string()
        .regex(/^\d+$/, 'Booking id should be a valid number')
        .transform((value) => BigInt(value))
        .refine((value) => value > 0n, {
            message: 'Booking id must be a positive integer',
        }),
});