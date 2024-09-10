import { Database } from './schema';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
    pool: new Pool({
        host: process.env.DB_HOST,
        port: 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 10,
        ssl: {
            rejectUnauthorized: false
        }
    })
});

export const db = new Kysely<Database>({
    dialect,
});
