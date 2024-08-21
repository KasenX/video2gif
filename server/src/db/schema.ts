import {
    ColumnType,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface Database {
    video: VideoTable,
    gif: GifTable
}

export interface VideoTable {
    id: string,
    user_id: number,
    name: string,
    extension: string,
    size: number,
    uploaded: ColumnType<Date, Date, never>
}

export type Video = Selectable<VideoTable>;
export type NewVideo = Insertable<VideoTable>;
export type VideoUpdate = Updateable<VideoTable>;

export interface GifTable {
    id: string,
    user_id: number,
    video_id: string,
    name: string,
    extension: string,
    size: number,
    status: 'in_progress' | 'completed' | 'failed',
    created: ColumnType<Date, Date, never>,
    completed: ColumnType<Date | null, null, Date>
}

export type Gif = Selectable<GifTable>;
export type NewGif = Insertable<GifTable>;
export type GifUpdate = Updateable<GifTable>;
