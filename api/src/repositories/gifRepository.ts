import { getDb } from '../db/connection';
import type { NewGif, Gif } from '../db/schema';

export const findGif = async (gifId: string, userId: string): Promise<Gif | undefined> => {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('id', '=', gifId)
    .where('userId', '=', userId)
    .executeTakeFirst();
}

export const findGifs = async (userId: string): Promise<Gif[]> => {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('userId', '=', userId)
    .execute();
}

export const createGif = async (gif: NewGif): Promise<Gif> => {
    return await getDb().insertInto('gif')
    .values(gif)
    .returningAll()
    .executeTakeFirstOrThrow();
}
