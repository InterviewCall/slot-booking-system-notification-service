import { EmailStatus } from '../types/Aws.type';

// Which SES event wins when a message has several: the higher number is the more important one.
export const SES_EVENT_STATUS_PRIORITY: Record<string, number> = {
    SEND: 1,
    DELIVERY: 2,
    OPEN: 3,
    CLICK: 4,
    DELIVERY_DELAY: 5,
    BOUNCE: 6,
    COMPLAINT: 7,
    REJECT: 8,
    RENDERING_FAILURE: 9,
};

export const SES_EVENT_TO_STATUS: Record<string, EmailStatus> = {
    SEND: 'sent',
    DELIVERY: 'delivered',
    OPEN: 'opened',
    CLICK: 'clicked',
    BOUNCE: 'bounced',
    COMPLAINT: 'complained',
    REJECT: 'rejected',
    DELIVERY_DELAY: 'delivery_delayed',
    RENDERING_FAILURE: 'rendering_failed',
};
