import { z } from 'zod';

import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';

/**
 * Job payload produced by WorkR's User-Service right after a Working Professional signs up.
 * It crosses a service boundary, so the processor validates it before anything is sent.
 */
export const workrSignupNotificationSchema = z.object({
    userId: z.number().int().positive(),
    candidateName: z.string().trim().min(1),
    candidateEmail: z.string().trim().email(),
    // E.164 (+91XXXXXXXXXX); may be empty when the user has no usable number (then WHATSAPP must not be requested)
    candidatePhone: z.string().trim().default(''),
    readinessLink: z.string().url(),
    subject: z.string().trim().min(1),
    channels: z.array(z.nativeEnum(NotificationChannel)).min(1),
    templateKeys: z.object({
        [NotificationChannel.EMAIL]: z.string().trim().min(1).optional(),
        [NotificationChannel.WHATSAPP]: z.string().trim().min(1).optional()
    })
}).superRefine((payload, ctx) => {
    for(const channel of payload.channels) {
        if(!payload.templateKeys[channel]) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['templateKeys', channel],
                message: `Missing template key for channel ${channel}`
            });
        }
    }

    if(payload.channels.includes(NotificationChannel.WHATSAPP) && !/^\+?\d{10,15}$/.test(payload.candidatePhone)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['candidatePhone'],
            message: 'A valid phone number is required for the WHATSAPP channel'
        });
    }
});

export type WorkrSignupNotificationDto = z.infer<typeof workrSignupNotificationSchema>;
