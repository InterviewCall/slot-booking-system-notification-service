import { NotificationPayload } from '../types/NotificationPayload.type';

export interface NotificationExecutorStrategy {
    send(payload: NotificationPayload): Promise<string>
}