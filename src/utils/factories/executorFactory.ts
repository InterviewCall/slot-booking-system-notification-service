import { NotificationExecutorStrategy } from '../../interfaces/INotificationExecutorStrategy.interface';
import { EmailExecutor } from '../../strategies/executors/Email.executor';
import { WhatsAppExecutor } from '../../strategies/executors/WhatsApp.executor';
import { NotificationChannel } from '../enums/NotificationChannel';

export function createNotificationExecutor(channel: NotificationChannel): NotificationExecutorStrategy | null {
    if(channel == NotificationChannel.EMAIL) {
        return new EmailExecutor();
    }

    else if(channel == NotificationChannel.WHATSAPP) {
        return new WhatsAppExecutor();
    }

    return null;
}