import { NotificationType } from '../../generated/prisma/enums';
import { sesConfig, workrSesConfig } from '../configs/server.config';
import { WorkrSignupNotificationDto } from '../dto/WorkrSignupNotification.dto';
import NotificationRepository from '../repositories/Notification.repository';
import NotificationDeliveryRepository from '../repositories/NotificationDelivery.repository';
import { EmailSender, NotificationExecutorPayload } from '../types/NotificationPayload.type';
import { NotificationChannel } from '../utils/enums/NotificationChannel.enum';
import { getFirstName } from '../utils/helpers/name.helper';
import { deliverToChannels } from './channelDelivery.helper';

/**
 * Sends the product company readiness check message(s) to a candidate who just signed up on WorkR.
 */
class WorkrSignupNotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly notificationDeliveryRepository: NotificationDeliveryRepository
    ) {}

    // Safe to run again for the same WorkR user: resumes the existing notification and only
    // sends the channels that have not been delivered yet. Throws if any channel failed.
    async sendNotification(payload: WorkrSignupNotificationDto): Promise<void> {
        const notification = await this.notificationRepository.findOrCreateNotification({
            candidateId: payload.userId,
            externalRef: `workr-user-${payload.userId}`,
            notificationType: NotificationType.WORKR_SIGNUP_DAY0
        });

        const firstName = getFirstName(payload.candidateName);

        await deliverToChannels({
            notificationId: notification.id,
            channels: payload.channels,
            notificationDeliveryRepository: this.notificationDeliveryRepository,
            buildExecutorPayload: (channel: NotificationChannel): NotificationExecutorPayload => {
                // the payload schema guarantees a template key for every requested channel
                const templateKey = payload.templateKeys[channel] as string;

                if(channel == NotificationChannel.EMAIL) {
                    return {
                        recipient: payload.candidateEmail,
                        candidateName: payload.candidateName,
                        subject: payload.subject,
                        templateKey,
                        emailParams: {
                            firstName,
                            readinessLink: payload.readinessLink
                        },
                        emailSender: this.getEmailSender()
                    };
                }

                return {
                    // AiSensy expects the number with country code and without "+"
                    recipient: payload.candidatePhone.replace(/\D/g, ''),
                    candidateName: payload.candidateName,
                    subject: payload.subject,
                    templateKey,
                    whatsAppParams: [firstName]
                };
            }
        });
    }

    // WORKR_SES_* overrides the default sender; anything left empty falls back to the default.
    private getEmailSender(): EmailSender | undefined {
        if(!workrSesConfig.SES_FROM_EMAIL) {
            return undefined;
        }

        return {
            fromEmail: workrSesConfig.SES_FROM_EMAIL,
            fromName: workrSesConfig.SES_FROM_NAME || sesConfig.SES_FROM_NAME,
            replyTo: workrSesConfig.SES_REPLY_TO_EMAIL || sesConfig.SES_REPLY_TO_EMAIL
        };
    }
}

export default WorkrSignupNotificationService;
