import type { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4, validate } from 'uuid';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { getDb } from '../db/connection';
import { createVideo, findVideo, findVideos } from '../repositories/videoRepository';
import { createGif } from '../repositories/gifRepository';
import { getPreferences } from '../services/preferencesService';
import { generateVideoUrl, uploadVideoFile, sendToQueue } from '../services/awsService';
import type { VideoConversionBody } from '../types/types';

const supportedVideoFormats = [
    'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v', 'ogg'
];

export const checkVideoOwnership = async (req: Request, res: Response, next: NextFunction) => {
    const videoId = req.params.videoId as string;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    if (!validate(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    try {
        const video = await findVideo(videoId, userId);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        req.video = video;

        next();
    } catch (err) {
        console.error('Error checking video ownership:', err);
        return res.status(500).json({ error: 'Failed to check video ownership' });
    }
}

export const getVideo = async (req: Request, res: Response) => {
    const video = req.video;

    if (!video) {
        return res.status(400).json({ error: 'Failed to find the video file' });
    }

    const preSignedUrl = await generateVideoUrl(video.id, video.extension);
    res.redirect(preSignedUrl);
}

export const getVideos = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ error: 'Failed to find the user' });
        }

        const videos = await findVideos(userId);

        return res.status(200).json({ videos });
    } catch (err) {
        console.error('Error fetching videos:', err);
        return res.status(500).json({ error: 'Failed to retrieve videos' });
    }
};

const validateFileUpload = (req: Request): fileUpload.UploadedFile | null => {
    if (!req.files || !req.files.file) {
        return null;
    }
    return req.files.file as fileUpload.UploadedFile;
}

const isVideoFormatSupported = (file: fileUpload.UploadedFile): boolean => {
    const fileExtension = path.extname(file.name).slice(1);
    return !supportedVideoFormats.includes(fileExtension);
}

const getVideoDuration = (videoPath: string): Promise<number | undefined> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata.format.duration);
        });
    });
}

export const uploadVideo = async (req: Request, res: Response) => {
    const file = validateFileUpload(req);
    if (!file) {
        return res.status(400).json({ error: 'Failed to find the video file' });
    }
    if (isVideoFormatSupported(file)) {
        return res.status(400).json({ error: 'Unsupported video format' });
    }

    const fileName = path.parse(file.name).name;
    const fileExtension = path.extname(file.name).slice(1);
    const videoId = uuidv4();
    const userId = req.user?.id;
    const duration = await getVideoDuration(file.tempFilePath);

    if (!duration) {
        return res.status(400).json({ error: 'Failed to get video duration' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    try {

        await getDb().transaction().execute(async (trx) => {
            await createVideo(trx, {
                id: videoId,
                userId: userId,
                name: fileName,
                extension: fileExtension,
                duration: duration,
                size: file.size,
                uploaded: new Date()
            });

            await uploadVideoFile(file.tempFilePath, videoId, fileExtension);
        });

        const videoUrl = `${req.protocol}://${req.get('host')}/api/videos/${videoId}`;
        res.status(201).header('Location', videoUrl).json({
            message: 'Video uploaded successfully',
            videoId: videoId,
            location: videoUrl,
        });
    } catch (err) {
        console.error('Error during video upload', err);
        res.status(500).json({ error: 'Failed to upload video' });
    }
};

const resolveSettings = async (body: VideoConversionBody, userId: string): Promise<VideoConversionBody> => {
    const preferences = await getPreferences(userId);
    const settings: VideoConversionBody = {};

    settings.fps = body.fps || preferences?.fps || 10;
    settings.scaleX = body.scaleX || preferences?.scaleX || 320;
    settings.scaleY = body.scaleY || preferences?.scaleY || -1;
    settings.startTime = body.startTime || 0;
    settings.duration = body.duration;

    return settings;
}

const validateSettings = (settings: VideoConversionBody, videoDuration: number): boolean => {
    if (typeof settings.fps !== 'number' || settings.fps <= 0) {
        console.error(`Invalid fps: ${settings.fps}`);
        return false;
    }

    if (typeof settings.scaleX !== 'number' || (settings.scaleX <= 0 && settings.scaleX !== -1)) {
        console.error(`Invalid scaleX: ${settings.scaleX}`);
        return false;
    }

    if (typeof settings.scaleY !== 'number' || (settings.scaleY <= 0 && settings.scaleY !== -1)) {
        console.error(`Invalid scaleY: ${settings.scaleY}`);
        return false;
    }

    if (typeof settings.startTime !== 'number' || settings.startTime < 0) {
        console.error(`Invalid startTime: ${settings.startTime}`);
        return false;
    }

    if (settings.duration !== undefined && settings.duration !== null && (typeof settings.duration !== 'number' || settings.duration <= 0)) {
        console.error(`Invalid duration: ${settings.duration}`);
        return false;
    }

    const endTime = settings.startTime + (settings.duration || 0);
    if (endTime > videoDuration) {
        console.error(`Invalid end time: ${endTime} (video duration: ${videoDuration}, start time: ${settings.startTime}, duration: ${settings.duration})`);
        return false;
    }

    return true;
}

export const convertVideo = async (req: Request, res: Response) => {
    const body = req.body as VideoConversionBody;
    const video = req.video;

    if (!video) {
        return res.status(400).json({ error: 'Video not provided' });
    }

    const gifId = uuidv4();
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    const settings = await resolveSettings(body, userId);

    try {
        if (!validateSettings(settings, video.duration)) {
            return res.status(400).json({ error: 'Invalid conversion settings' });
        }

        await createGif({
            id: gifId,
            userId: userId,
            videoId: video.id,
            name: video.name,
            extension: 'gif',
            size: -1,
            fps: settings.fps!,
            scaleX: settings.scaleX!,
            scaleY: settings.scaleY!,
            startTime: settings.startTime!,
            duration: settings.duration,
            status: 'new',
            statusChanged: new Date(),
            created: new Date(),
            completed: null
        });

        const gifUrl = `${req.protocol}://${req.get('host')}/api/gifs/${gifId}`;
        res.status(202).header('Location', gifUrl).json({
            message: 'GIF conversion in progress',
            gifId: gifId,
            location: gifUrl
        });
    } catch (err) {
        console.error('Error during conversion initiation', err);
        res.status(500).json({ error: 'Error during conversion initiation' });
    }

    // Send the gifId to the SQS queue for processing
    await sendToQueue(gifId);
};
