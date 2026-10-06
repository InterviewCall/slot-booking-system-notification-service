export type EmailStatus =
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'complained'
    | 'rejected'
    | 'delivery_delayed'
    | 'rendering_failed'
    | 'unknown';

export type EmailStatusResult = {
    messageId: string;
    status: EmailStatus;
    events: Array<{
        type: string;
        timestamp?: Date;
    }>;
};
