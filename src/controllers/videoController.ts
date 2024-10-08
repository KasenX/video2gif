import type { Request, Response, NextFunction } from 'express';
import type { VideoConversionBody } from '../types/types';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4, validate } from 'uuid';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { getDb } from '../db/connection';
import { createVideo, findVideo, findVideos } from '../repositories/videoRepository';
import { createGif, updateGif } from '../repositories/gifRepository';
import { getPreferences } from '../services/preferencesService';
import { generateVideoUrl, storeVideoFile, uploadGifFile, uploadVideoFile } from '../services/awsService';

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

function validateFileUpload(req: Request): fileUpload.UploadedFile | null {
    if (!req.files || !req.files.file) {
        return null;
    }
    return req.files.file as fileUpload.UploadedFile;
}

function isVideoFormatSupported(file: fileUpload.UploadedFile): boolean {
    const fileExtension = path.extname(file.name).slice(1);
    return !supportedVideoFormats.includes(fileExtension);
}

function getVideoDuration(videoPath: string): Promise<number | undefined> {
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
                user_id: userId,
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

async function resolveSettings(body: VideoConversionBody, userId: string): Promise<VideoConversionBody> {
    const preferences = await getPreferences(userId);
    const settings: VideoConversionBody = {};

    settings.fps = body.fps || preferences?.fps || 10;
    settings.scale_x = body.scale_x || preferences?.scale_x || 320;
    settings.scale_y = body.scale_y || preferences?.scale_y || -1;
    settings.startTime = body.startTime || 0;
    settings.duration = body.duration;

    return settings;
}

function validateSettings(settings: VideoConversionBody, videoDuration: number): boolean {
    if (typeof settings.fps !== 'number' || settings.fps <= 0) {
        return false;
    }

    if (typeof settings.scale_x !== 'number' || (settings.scale_x <= 0 && settings.scale_x !== -1)) {
        return false;
    }

    if (typeof settings.scale_y !== 'number' || (settings.scale_y <= 0 && settings.scale_y !== -1)) {
        return false;
    }

    if (typeof settings.startTime !== 'number' || settings.startTime < 0) {
        return false;
    }

    if (settings.duration !== undefined && settings.duration !== null && (typeof settings.duration !== 'number' || settings.duration <= 0)) {
        return false;
    }

    const endTime = settings.startTime + (settings.duration || videoDuration);
    if (endTime > videoDuration) {
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
            user_id: userId,
            video_id: video.id,
            name: video.name,
            extension: 'gif',
            size: -1,
            status: 'in_progress',
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

    await convertVideoToGif(video.id, video.extension, gifId, settings);
};

const convertVideoToGif = async (videoId: string, videoExtension: string, gifId: string, settings: VideoConversionBody) => {
    // Temporary store the video file locally
    const videoPath = await storeVideoFile(videoId, videoExtension);
    const gifPath = path.join(__dirname, '..', '..', 'gifs', `${gifId}.gif`);

    try {
        const ffmpegCommmand = ffmpeg(videoPath)
            .setStartTime(settings.startTime!)
            .outputOptions([
                '-vf', `fps=${settings.fps},scale=${settings.scale_x}:${settings.scale_y}:flags=lanczos`
            ]);

        if (settings.duration) {
            ffmpegCommmand.duration(settings.duration);
        }

        ffmpegCommmand
        .on('end', async () => {
            // Upload the gif file to S3
            await uploadGifFile(gifPath, gifId);

            await updateGif(gifId, {
                size: fs.statSync(gifPath).size,
                status: 'completed',
                completed: new Date(),
            });

            // Delete the video and gif file from the local file system
            fs.unlinkSync(videoPath);
            fs.unlinkSync(gifPath);
        })
        .on('error', async (err) => {
            await updateGif(gifId, {
                status: 'failed',
                completed: new Date()
            });
            console.error('Error during conversion', err);
        })
        .save(gifPath);
    } catch (err) {
        console.error('Unexpected error during conversion', err);
    }
};
