import { db } from '../db/connection';
import type { NewGif, Gif, GifUpdate } from '../db/schema';

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

export async function createGif(gif: NewGif): Promise<Gif> {
    return await db.insertInto('gif')
    .values(gif)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateGif(gifId: string, gif: Partial<GifUpdate>): Promise<Gif> {
    return await db.updateTable('gif')
    .set(gif)
    .where('id', '=', gifId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
