import { NotificationExecutorPayload } from '../types/NotificationPayload.type';

export interface NotificationExecutorStrategy {
    send(payload: NotificationExecutorPayload): Promise<string>
}