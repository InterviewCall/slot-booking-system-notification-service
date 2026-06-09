import axios from 'axios';

import { aiSensyConfig } from '../../configs/server.config';
import { NotificationPayload } from '../../types/NotificationPayload.type';
import { WhatsAppApiRequestBody } from '../../types/Request.type';
import { WhatsAppApiResponse } from '../../types/Response.type';
import { InternalServerError } from '../../utils/errors/app.error';
import { NotificationExecutorStrategy } from '../NotificationExecutor.strategy';

export class WhatsAppExecutor implements NotificationExecutorStrategy {
    async send(payload: NotificationPayload): Promise<string> {
        const requestBody: WhatsAppApiRequestBody = {
            apiKey: aiSensyConfig.AISENSY_API_KEY,
            campaignName: payload.templateKeys.WHATSAPP,
            destination: payload.candidatePhone,
            userName: payload.candidateName,
            templateParams: [
                payload.candidateName,
                payload.slotDate,
                payload.slotTime
            ]
        };

        const response = await axios.post<WhatsAppApiResponse>(
            aiSensyConfig.AISENSY_API_URL,
            requestBody,
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const submittedMessageId: string = response.data?.submitted_message_id;

        if(!submittedMessageId) {
            throw new InternalServerError('AiSensy did not return submitted_message_id');
        }

        return submittedMessageId;
    }
}