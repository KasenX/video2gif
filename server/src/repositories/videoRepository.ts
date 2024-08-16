import { db } from '../db/connection';
import { NewVideo, Video } from '../db/schema';

export async function findVideos(userId: number): Promise<Video[]> {
    return await db.selectFrom('video')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();
}

export async function createVideo(video: NewVideo): Promise<Video> {
    return await db.insertInto('video')
    .values(video)
    .returningAll()
    .executeTakeFirstOrThrow();
}
