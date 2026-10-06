export type ServerConfig = {
    PORT: number,
    NODE_ENV?: string
    REDIS_PORT: number,
    REDIS_HOST: string,
    REDIS_PASSWORD?: string,
    REDIS_TLS: boolean
}

export type QueueConfig = {
    JOB_ATTEMPTS: number
    RETRY_BACKOFF_MS: number
    FAILED_JOB_RETENTION_DAYS: number
    FAILED_JOB_RETENTION_COUNT: number
}

export type SESConfig = {
    SES_FROM_EMAIL: string
    SES_FROM_NAME: string
    SES_REPLY_TO_EMAIL: string
    SES_CONFIGURATION_SET_NAME: string
}

export type WorkrSesConfig = {
    SES_FROM_EMAIL: string
    SES_FROM_NAME: string
    SES_REPLY_TO_EMAIL: string
}

export type AwsConfig = {
    AWS_REGION: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
}

export type AiSensyConfig = {
    AISENSY_API_KEY: string
    AISENSY_API_URL: string
}

export type DBConfig = {
    DB_HOST: string
    DB_USER: string
    DB_PASSWORD: string
    DB_NAME: string
    DB_SSL: boolean
    DB_SSL_CA_PATH: string
}


export type InternalApiConfig = {
    INTERNAL_API_KEY: string
    INTERNAL_API_KEY_HEADER: string
}
