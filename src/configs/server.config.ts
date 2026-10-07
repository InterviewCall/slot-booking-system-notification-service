import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    NODE_ENV?: string
    REDIS_PORT: number,
    REDIS_HOST: string
}

type QueueConfig = {
    JOB_ATTEMPTS: number
    RETRY_BACKOFF_MS: number
    FAILED_JOB_RETENTION_DAYS: number
    FAILED_JOB_RETENTION_COUNT: number
}

type SESConfig = {
    SES_FROM_EMAIL: string
    SES_FROM_NAME: string
    SES_REPLY_TO_EMAIL: string
    SES_CONFIGURATION_SET_NAME: string
}

type WorkrSesConfig = {
    SES_FROM_EMAIL: string
    SES_FROM_NAME: string
    SES_REPLY_TO_EMAIL: string
}

type AwsConfig = {
    AWS_REGION: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
}

type AiSensyConfig = {
    AISENSY_API_KEY: string
    AISENSY_API_URL: string
}

type DBConfig = {
    DB_HOST: string
    DB_USER: string
    DB_PASSWORD: string
    DB_NAME: string
}
type FrontendConfig = {
    ADMIN_FRONTEND_URL: string,
}

dotenv.config();

export const serverConfig: ServerConfig =  {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_HOST: process.env.REDIS_Host || 'localhost',
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379
};

// Job retry / retention policy, shared by every notification queue.
//  - a job that succeeds is deleted from Redis immediately
//  - a job that fails is retried JOB_ATTEMPTS times in total (exponential backoff starting at RETRY_BACKOFF_MS)
//  - once all attempts are used it stays in the "failed" set for FAILED_JOB_RETENTION_DAYS (max FAILED_JOB_RETENTION_COUNT)
export const queueConfig: QueueConfig = {
    JOB_ATTEMPTS: Number(process.env.QUEUE_JOB_ATTEMPTS) || 5,
    RETRY_BACKOFF_MS: Number(process.env.QUEUE_RETRY_BACKOFF_MS) || 30 * 1000,
    FAILED_JOB_RETENTION_DAYS: Number(process.env.QUEUE_FAILED_RETENTION_DAYS) || 1,
    FAILED_JOB_RETENTION_COUNT: Number(process.env.QUEUE_FAILED_RETENTION_COUNT) || 5000
};

export const sesConfig: SESConfig = {
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || '',
    SES_FROM_NAME: process.env.SES_FROM_NAME || '',
    SES_REPLY_TO_EMAIL: process.env.SES_REPLY_TO_EMAIL || '',
    SES_CONFIGURATION_SET_NAME: process.env.SES_CONFIGURATION_SET_NAME || ''
};

// Optional sender for WorkR signup emails (e.g. notification.workr.club). Any value left empty falls back to the sesConfig sender.
export const workrSesConfig: WorkrSesConfig = {
    SES_FROM_EMAIL: process.env.WORKR_SES_FROM_EMAIL || '',
    SES_FROM_NAME: process.env.WORKR_SES_FROM_NAME || '',
    SES_REPLY_TO_EMAIL: process.env.WORKR_SES_REPLY_TO_EMAIL || ''
};

export const awsConfig: AwsConfig = {
    AWS_REGION: process.env.AWS_REGION || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || ''
};

export const aiSensyConfig: AiSensyConfig = {
    AISENSY_API_KEY: process.env.AISENSY_API_KEY || '',
    AISENSY_API_URL: process.env.AISENSY_API_URL || ''
};

export const dbConfig: DBConfig = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '1748arijiT#',
    DB_NAME: process.env.DB_NAME || 'ic_notifications',
};
export const frontendConfig: FrontendConfig = {
    ADMIN_FRONTEND_URL: String(process.env.ADMIN_FRONTEND_URL),
};