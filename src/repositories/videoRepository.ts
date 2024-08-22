import { db } from '../db/connection';
import type { Database, NewVideo, Video } from '../db/schema';
import type { Transaction } from 'kysely';

export async function findVideo(videoId: string, userId: number): Promise<Video | undefined> {
    return await db.selectFrom('video')
    .selectAll()
    .where('id', '=', videoId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function findVideos(userId: number): Promise<Video[]> {
    return await db.selectFrom('video')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();
}

export async function createVideo(trx: Transaction<Database>, video: NewVideo): Promise<Video> {
    return await trx.insertInto('video')
    .values(video)
    .returningAll()
    .executeTakeFirstOrThrow();
}