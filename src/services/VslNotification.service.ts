import { NotificationType } from '../../generated/prisma/enums';

import { VslNotificationDto } from '../dto/VslNotification.dto';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import NotificationRepository from '../repositories/Notification.repository';
import { NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { getFirstName } from '../utils/helpers/name.helper';
import { deliverToChannels } from './channelDelivery.helper';

/**
 * Sends email notifications for a VSL abandonment step.
 * Retries reuse the same notification record and skip channels already marked SENT.
 */
class VslNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly notificationDeliveryRepository: NotificationDeliveryRepository,
    ) {}

    /**
     * Creates or reuses the notification record, then sends through the existing
     * channel-delivery helper.
     */
    async sendNotification(payload: VslNotificationDto): Promise<void> {
        const notification =
            await this.notificationRepository.findOrCreateNotification({
                // Prisma's schema defines candidateId as BigInt.
                candidateId: BigInt(payload.candidateId),
                submissionId: payload.submissionId,

                // A stable reference identifies this particular VSL email step.
                externalRef: `vsl-run-${payload.vslRunId}-step-${payload.vslStepId}`,

                // Different VSL steps need separate notification records.
                reminderNumber: payload.vslStepId,
                notificationType: NotificationType.VSL_ABANDONMENT,
            });

        const firstName = getFirstName(payload.candidateName);

        // VSL abandonment currently sends email only.
        await deliverToChannels({
            notificationId: notification.id,
            channels: [NotificationChannel.EMAIL],
            notificationDeliveryRepository: this.notificationDeliveryRepository,

            buildExecutorPayload: (
                channel: NotificationChannel,
            ): NotificationExecutorPayload => {
                if (channel !== NotificationChannel.EMAIL) {
                    throw new Error(
                        `Unsupported VSL notification channel: ${channel}`,
                    );
                }

                const templateKey =
                    payload.templateKeys[NotificationChannel.EMAIL];

                if (!templateKey) {
                    throw new Error(
                        `Missing email template for VSL step ${payload.stepKey}`,
                    );
                }

                return {
                    recipient: payload.candidateEmail,
                    candidateName: payload.candidateName,
                    subject: payload.subject,
                    templateKey,

                    // These values are available to the Handlebars email template.
                    emailParams: {
                        firstName,
                        formLink: payload.formLink,
                    },
                };
            },
        });
    }
}

export default VslNotificationService;
