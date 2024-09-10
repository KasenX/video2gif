import { Database } from './schema';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
    pool: new Pool({
        host: 'n12134171-assessment.ce2haupt2cta.ap-southeast-2.rds.amazonaws.com',
        port: 5432,
        database: 'video2gif',
        user: 'video2gif',
        password: 'YXO~Q{k0dcTI3*Q5cPQ5IRH7nP$U',
        max: 10,
        ssl: {
            rejectUnauthorized: false
        }
    })
});

export const db = new Kysely<Database>({
    dialect,
});
