import { GetMessageInsightsCommand,SESv2Client } from '@aws-sdk/client-sesv2';

import logger from './logger.config';
import { awsConfig } from './server.config';

export const sesClient = new SESv2Client({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

type EmailStatus =
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

type EmailStatusResult = {
    messageId: string;
    status: EmailStatus;
    events: Array<{
        type: string;
        timestamp?: Date;
    }>;
};

const SES_EVENT_STATUS_PRIORITY: Record<string, number> = {
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

const SES_EVENT_TO_STATUS: Record<string, EmailStatus> = {
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

function isAwsNotFoundException(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'NotFoundException'
    );
}

export async function getSesEmailStatusByMessageId(
    messageId: string
): Promise<EmailStatusResult> {
    try {
        const command = new GetMessageInsightsCommand({
            MessageId: messageId
        });

        const response = await sesClient.send(command);

        const events =
            response.Insights?.flatMap((insight) => {
                return insight.Events?.map((event) => ({
                    type: event.Type ?? 'UNKNOWN',
                    timestamp: event.Timestamp,
                })) ?? [];
            }) ?? [];

        if (events.length === 0) {
            console.log('printing in try');
            return {
                messageId,
                status: 'unknown',
                events: [],
                // reason: 'No SES insight events found yet',
            };
        }

        const latestHighestPriorityEvent = events.reduce(
            (selected, current) => {
                const selectedPriority =
                    SES_EVENT_STATUS_PRIORITY[selected.type] ?? 0;

                const currentPriority =
                    SES_EVENT_STATUS_PRIORITY[current.type] ?? 0;

                if (currentPriority > selectedPriority) {
                    return current;
                }

                if (
                    currentPriority === selectedPriority &&
                    current.timestamp &&
                    selected.timestamp &&
                    current.timestamp > selected.timestamp
                ) {
                    return current;
                }

                return selected;
            }
        );

        return {
            messageId,
            status:
                SES_EVENT_TO_STATUS[latestHighestPriorityEvent.type] ??
                'unknown',
            events,
        };
    } catch (error: unknown) {
        if (isAwsNotFoundException(error)) {
            logger.error('printing is catch', { error });
            return {
                messageId,
                status: 'unknown',
                events: [],
                // reason:'SES message insights not found. Wait a few minutes, verify AWS_REGION, and confirm the email was sent with the correct ConfigurationSetName.',
            };
        }

        throw error;
    }

    
}