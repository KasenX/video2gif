import { getDb } from './db/connection';
import { Video, Gif, GifUpdate } from './db/schema';

export const findVideo = async (videoId: string): Promise<Video | undefined> => {
    return await getDb().selectFrom('video')
    .selectAll()
    .where('id', '=', videoId)
    .executeTakeFirst();
}

export const findGif = async (gifId: string): Promise<Gif | undefined> => {
    return await getDb().selectFrom('gif')
    .selectAll()
    .where('id', '=', gifId)
    .executeTakeFirst();
}

export const updateGif = async (gifId: string, gif: Partial<GifUpdate>): Promise<Gif> => {
    return await getDb().updateTable('gif')
    .set(gif)
    .where('id', '=', gifId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
