import { getDb } from './db/connection';
import { Video, Gif, GifUpdate } from './db/schema';

export async function findVideo(videoId: string): Promise<Video | undefined> {
    return await getDb().selectFrom('video')
    .selectAll()
    .where('id', '=', videoId)
    .executeTakeFirst();
}

export async function findGif(gifId: string): Promise<Gif | undefined> {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('id', '=', gifId)
    .executeTakeFirst();
}

export async function updateGif(gifId: string, gif: Partial<GifUpdate>): Promise<Gif> {
    return await getDb().updateTable('gif')
    .set(gif)
    .where('id', '=', gifId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
