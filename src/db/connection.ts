import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './schema';

let db: Kysely<Database> | undefined;

export const initializeDb = () => {
    if (db) return;

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

    db = new Kysely<Database>({ dialect });
}

export const getDb = (): Kysely<Database> => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}
