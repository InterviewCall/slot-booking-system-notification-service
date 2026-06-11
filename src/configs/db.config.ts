import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../generated/prisma/client';
import { dbConfig } from './server.config';

const adapter = new PrismaMariaDb({
    host: dbConfig.DB_HOST,
    user: dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DB_NAME,
    connectionLimit: 5
});

export const prisma = new PrismaClient({ adapter });