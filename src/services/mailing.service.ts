// import { getSesEmailStatusByMessageId } from '../configs/aws.config';
// import logger from '../configs/logger.config';

// export async function sendEmail(toEmail: string, subject: string, htmlBody: string, textBody: string) {
//     try {
//         const response = await sendEmailWithSes(toEmail, subject, htmlBody, textBody);
//         return response;
//     } catch (error) {
//         logger.error('Service method is failed', { error });
//     }
// }

// export async function getStatus(messageId: string) {
//     try {
//         const response = await getSesEmailStatusByMessageId(messageId);
//         return response;
//     } catch (error) {
//         logger.error('Service method is failed', { error });
//     }
// }