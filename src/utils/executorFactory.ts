import { EmailExecutor } from '../strategies/executors/Email.executor';
import { WhatsAppExecutor } from '../strategies/executors/WhatsApp.executor';
import { NotificationExecutorStrategy } from '../strategies/NotificationExecutor.strategy';
import { NotificationChannel } from './enums/NotificationChannel.enum';

export function createNotificationExecutor(channel: NotificationChannel): NotificationExecutorStrategy | null {
    if(channel == NotificationChannel.EMAIL) {
        return new EmailExecutor();
    }

    else if(channel == NotificationChannel.WHATSAPP) {
        return new WhatsAppExecutor();
    }

    return null;
}