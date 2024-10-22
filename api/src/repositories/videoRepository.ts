import type { Transaction } from 'kysely';
import { getDb } from '../db/connection';
import type { Database, NewVideo, Video } from '../db/schema';

export const findVideo = async (videoId: string, userId: string): Promise<Video | undefined> => {
    return await getDb().selectFrom('video')
    .selectAll()
    .where('id', '=', videoId)
    .where('userId', '=', userId)
    .executeTakeFirst();
}

export const findVideos = async (userId: string): Promise<Video[]> => {
    return await getDb().selectFrom('video')
    .selectAll()
    .where('userId', '=', userId)
    .execute();
}

export const createVideo = async (trx: Transaction<Database>, video: NewVideo): Promise<Video> => {
    return await trx.insertInto('video')
    .values(video)
    .returningAll()
    .executeTakeFirstOrThrow();
}
