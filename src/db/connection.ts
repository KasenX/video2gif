import { Database } from './schema';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
    pool: new Pool({
        database: 'video2gif',
        host: 'localhost',
        user: 'admin',
        password: 'password',
        port: 5432,
        max: 10,
    })
});

export const db = new Kysely<Database>({
    dialect,
});
