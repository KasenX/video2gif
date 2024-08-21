import type { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4, validate } from 'uuid';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { db } from '../db/connection';
import { createVideo, findVideo, findVideos } from '../repositories/videoRepository';
import { createGif, updateGif } from '../repositories/gifRepository';

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

export const getVideo = (req: Request, res: Response) => {
    const video = req.video;

    if (!video) {
        return res.status(400).json({ error: 'Failed to find the video file' });
    }

    const videoPath = path.join(__dirname, '..', 'videos', `${video.id}${video.extension}`);

    res.sendFile(videoPath, (err) => {
        if (err) {
            console.error('Error serving the video file', err);
            res.status(500).json({ error: 'Failed to serve the video file' });
        }
    });
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

function moveVideoFile(file: fileUpload.UploadedFile, uniqueFileName: string): Promise<void> {
    const filePath = path.join(__dirname, '..', 'videos', uniqueFileName);
    
    return new Promise((resolve, reject) => {
        file.mv(filePath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export const uploadVideo = async (req: Request, res: Response) => {
    const file = validateFileUpload(req);
    if (!file) {
        return res.status(400).json({ error: 'Failed to find the video file' });
    }

    const fileName = path.parse(file.name).name;
    const fileExtension = path.extname(file.name);
    const videoId = uuidv4();
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    try {
        const uniqueFileName = `${videoId}${fileExtension}`;

        await db.transaction().execute(async (trx) => {
            await createVideo(trx, {
                id: videoId,
                user_id: userId,
                name: fileName,
                extension: fileExtension,
                size: file.size,
                uploaded: new Date()
            });

            await moveVideoFile(file, uniqueFileName);
        });

        const videoUrl = `${req.protocol}://${req.get('host')}/videos/${videoId}`;
        res.status(201).header('Location', videoUrl).json({
            message: 'Video uploaded successfully',
            location: videoUrl,
        });
    } catch (err) {
        console.error('Error during video upload:', err);
        res.status(500).json({ error: 'Failed to upload video' });
    }
};

export const convertVideo = async (req: Request, res: Response) => {
    const video = req.video;

    if (!video) {
        return res.status(400).json({ error: 'Video not provided' });
    }

    const gifId = uuidv4();
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    try {
        await createGif({
            id: gifId,
            user_id: userId,
            video_id: video.id,
            name: video.name,
            extension: '.gif',
            size: -1,
            status: 'in_progress',
            created: new Date(),
            completed: null
        });

        const gifUrl = `${req.protocol}://${req.get('host')}/gifs/${gifId}`;
        res.status(202).header('Location', gifUrl).json({
            message: 'GIF conversion in progress',
            location: gifUrl
        });
    } catch (err) {
        console.error('Error during conversion initiation', err);
        res.status(500).json({ error: 'Error during conversion initiation' });
    }

    convertVideoToGif(video.id, video.extension, gifId);
};

const convertVideoToGif = (videoId: string, videoExtension: string, gifId: string) => {
    const videoPath = path.join(__dirname, '..', 'videos', `${videoId}${videoExtension}`);
    const gifPath = path.join(__dirname, '..', 'gifs', `${gifId}.gif`);

    try {
        ffmpeg(videoPath)
        .outputOptions([
            '-vf', 'fps=10,scale=320:-1:flags=lanczos', // Set frame rate and scale
        ])
        .on('end', () => {
            updateGif(gifId, {
                size: fs.statSync(gifPath).size,
                status: 'completed',
                completed: new Date()
            });
        })
        .on('error', (err) => {
            updateGif(gifId, {
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
