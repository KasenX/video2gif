import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './schema';

let db: Kysely<Database> | undefined;

export const initializeDb = () => {
    if (db) return;

    const dialect = new PostgresDialect({
        pool: new Pool({
            host: '',
            port: 5432,
            database: '',
            user: '',
            password: '',
            max: 10,
            ssl: {
                rejectUnauthorized: false
            }
        })
    });

    db = new Kysely<Database>({ dialect });
}

export const getDb = (): Kysely<Database> => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}
