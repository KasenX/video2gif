import { Database } from './schema';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
    pool: new Pool({
        host: 'db',
        port: 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 10,
    })
});

export const db = new Kysely<Database>({
    dialect,
});
