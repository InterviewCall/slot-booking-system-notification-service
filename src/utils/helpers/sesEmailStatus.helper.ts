import { GetMessageInsightsCommand } from '@aws-sdk/client-sesv2';

import { sesClient } from '../../configs/aws.config';
import logger from '../../configs/logger.config';
import { SES_EVENT_STATUS_PRIORITY, SES_EVENT_TO_STATUS } from '../../constants/ses';
import { EmailStatusResult } from '../../types/Aws.type';
import { isAwsNotFoundException } from './error.helper';

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
