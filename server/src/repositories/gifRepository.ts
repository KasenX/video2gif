import { db } from '../db/connection';
import type { Database, NewGif, Gif } from '../db/schema';
import type { Transaction } from 'kysely';

export async function findGif(gifId: string, userId: number): Promise<Gif | undefined> {
    return await db.selectFrom('gif')
    .selectAll()
    .where('id', '=', gifId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function findGifs(userId: number): Promise<Gif[]> {
    return await db.selectFrom('gif')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();
}

export async function createGif(trx: Transaction<Database>, gif: NewGif): Promise<Gif> {
    return await trx.insertInto('gif')
    .values(gif)
    .returningAll()
    .executeTakeFirstOrThrow();
}
