import { z } from 'zod';

import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';

/**
 * Validates VSL notification jobs received from the candidate form service.
 * The current VSL flow sends email only.
 */
export const vslNotificationSchema = z.object({
    candidateId: z.number().int().positive(),

    // Public UUID of the candidate submission.
    submissionId: z.string().uuid(),

    // Identifies the VSL run and the scheduled email step.
    vslRunId: z.number().int().positive(),
    vslStepId: z.number().int().positive(),

    // Only the three supported VSL email steps are accepted.
    stepKey: z.enum([
        'VSL_D1_EMAIL',
        'VSL_D3_EMAIL',
        'VSL_D7_EMAIL',
    ]),

    // Candidate details needed to deliver the email.
    candidateName: z.string().trim().min(1),
    candidateEmail: z.string().trim().email(),

    // The candidate's qualification form link and email subject.
    formLink: z.string().url(),
    subject: z.string().trim().min(1),

    // Exactly one channel is accepted, and it must be email.
    channels: z.array(z.nativeEnum(NotificationChannel)).length(1),

    // An email template key is required for this flow.
    templateKeys: z.object({
        [NotificationChannel.EMAIL]: z.string().trim().min(1),
    }),
}).superRefine((payload, ctx) => {
    // Reject WhatsApp or any other channel for this VSL implementation.
    if (payload.channels[0] !== NotificationChannel.EMAIL) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['channels'],
            message: 'VSL abandonment notifications currently support email only',
        });
    }
});

// Derives the TypeScript payload type from the validation schema.
export type VslNotificationDto = z.infer<typeof vslNotificationSchema>;
