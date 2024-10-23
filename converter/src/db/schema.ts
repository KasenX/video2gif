import {
    ColumnType,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface Database {
    video: VideoTable,
    gif: GifTable,
    preferences: PreferencesTable,
}

export interface VideoTable {
    id: string,
    userId: string,
    name: string,
    extension: string,
    duration: number,
    size: number,
    uploaded: ColumnType<Date, Date, never>
}

export type Video = Selectable<VideoTable>;
export type NewVideo = Insertable<VideoTable>;
export type VideoUpdate = Updateable<VideoTable>;

export interface GifTable {
    id: string,
    userId: string,
    videoId: string,
    name: string,
    extension: string,
    size: number,
    fps: number;
    scaleX: number;
    scaleY: number;
    startTime: number;
    duration?: number;
    status: 'new' | 'in_progress' | 'completed' | 'failed',
    statusChanged: ColumnType<Date, Date, Date>,
    created: ColumnType<Date, Date, never>,
    completed: ColumnType<Date | null, null, Date>
}

export type Gif = Selectable<GifTable>;
export type NewGif = Insertable<GifTable>;
export type GifUpdate = Updateable<GifTable>;

export interface PreferencesTable {
    userId: string,
    fps: number,
    scaleX: number,
    scaleY: number,
    updated: ColumnType<Date, Date, Date>
}

export type Preferences = Selectable<PreferencesTable>;
export type NewPreferences = Insertable<PreferencesTable>;
export type PreferencesUpdate = Updateable<PreferencesTable>;
