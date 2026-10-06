import { SESv2Client } from '@aws-sdk/client-sesv2';

import { awsConfig } from './server.config';

export const sesClient = new SESv2Client({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});
