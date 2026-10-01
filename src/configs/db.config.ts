import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import fs from 'fs';

import { PrismaClient } from '../../generated/prisma/client';
import { dbConfig } from './server.config';

// RDS: encrypt the connection and verify the server against the AWS CA bundle (DB_SSL=true)
const ssl = dbConfig.DB_SSL
    ? {
        ca: fs.readFileSync(dbConfig.DB_SSL_CA_PATH, 'utf-8'),
        minVersion: 'TLSv1.2' as const,
        rejectUnauthorized: true
    }
    : undefined;

const adapter = new PrismaMariaDb({
    host: dbConfig.DB_HOST,
    user: dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DB_NAME,
    connectionLimit: 5,
    ssl,
    // MySQL 8 defaults to caching_sha2_password. Without this, the first connection after a MySQL
    // restart fails ("pool timeout") on a non-TLS link. Safe: the DB is only on the private network.
    allowPublicKeyRetrieval: true
});

export const prisma = new PrismaClient({ adapter });
