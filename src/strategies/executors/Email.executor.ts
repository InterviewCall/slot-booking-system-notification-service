import { SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-sesv2';

import { sesClient } from '../../configs/aws.config';
import { sesConfig } from '../../configs/server.config';
import { renderTemplate } from '../../templates/template.handler';
import { NotificationPayload } from '../../types/NotificationPayload.type';
import { TemplateType } from '../../utils/enums/TemplateType.enum';
import { InternalServerError } from '../../utils/errors/app.error';
import { NotificationExecutorStrategy } from '../NotificationExecutor.strategy';

export class EmailExecutor implements NotificationExecutorStrategy {
    async send(payload: NotificationPayload): Promise<string> {
        const contentParams = {
            candidateName: payload.candidateName,
            slotDate: payload.slotDate,
            slotTime: payload.slotTime
        };

        const htmlContent = await renderTemplate(
            payload.templateKeys.EMAIL,
            TemplateType.HTML,
            contentParams
        );

        const textContent = await renderTemplate(
            payload.templateKeys.EMAIL,
            TemplateType.TEXT,
            contentParams
        );

        const command = new SendEmailCommand({
            FromEmailAddress: `${sesConfig.SES_FROM_NAME} <${sesConfig.SES_FROM_EMAIL}>`,
            Destination: {
                ToAddresses: [payload.candidateEmail]
            },
            ReplyToAddresses: [sesConfig.SES_REPLY_TO_EMAIL],
            ConfigurationSetName: sesConfig.SES_CONFIGURATION_SET_NAME,
            Content: {
                Simple: {
                    Subject: {
                        Data: payload.subject,
                        Charset: 'UTF-8'
                    },

                    Body: {
                        Html: {
                            Data: htmlContent,
                            Charset: 'UTF-8'
                        },

                        Text: {
                            Data: textContent,
                            Charset: 'UTF-8'
                        }
                    }
                }
            }
        });

        const response: SendEmailCommandOutput = await sesClient.send(command);

        if(!response.MessageId) {
            throw new InternalServerError('SES email sent but MessageId was not returned');
        }

        return response.MessageId;
    }
}