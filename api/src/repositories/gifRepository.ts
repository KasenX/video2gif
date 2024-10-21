import { getDb } from '../db/connection';
import type { NewGif, Gif } from '../db/schema';

export async function findGif(gifId: string, userId: string): Promise<Gif | undefined> {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('id', '=', gifId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function findGifs(userId: string): Promise<Gif[]> {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();
}

export async function createGif(gif: NewGif): Promise<Gif> {
    return await getDb().insertInto('gif')
    .values(gif)
    .returningAll()
    .executeTakeFirstOrThrow();
}
