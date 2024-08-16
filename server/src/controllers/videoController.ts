import { type Request, type Response } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { findVideos, createVideo } from '../repositories/videoRepository';

export const getVideos = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID not provided.' });
        }

        const videos = await findVideos(userId);

        return res.status(200).json({ videos });
    } catch (err) {
        console.error('Error fetching videos:', err);
        return res.status(500).json({ error: 'Failed to retrieve videos' });
    }
};

export const uploadVideo = (req: Request, res: Response) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No video was uploaded.');
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const fileName = path.parse(file.name).name;
    const fileExtension = path.extname(file.name);
    const uuid = uuidv4();
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID not provided.' });
    }

    createVideo({
        id: uuid,
        user_id: userId,
        name: fileName,
        extension: fileExtension,
        size: file.size,
        uploaded: new Date()
    });

    const uniqueFileName = `${uuid}${fileExtension}`;
    const filePath = path.join(__dirname, '..', 'videos', uniqueFileName);

    file.mv(filePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/videos/${uniqueFileName}`;
    
        res.status(201).header('Location', fileUrl).send({
            message: 'Video uploaded successfully!',
            location: fileUrl
        });
    });
};

export const convertVideo = (req: Request, res: Response) => {
    const videoName = req.params.videoName as string;

    const videoPath = path.join(__dirname, '..', 'videos', videoName);
    const gifId = uuidv4();
    const gifPath = path.join(__dirname, '..', 'gifs', `${gifId}.gif`);

    ffmpeg(videoPath)
        .outputOptions([
            '-vf', 'fps=10,scale=320:-1:flags=lanczos', // Set frame rate and scale
        ])
        .on('end', () => {
            const gifUrl = `${req.protocol}://${req.get('host')}/gifs/${gifId}.gif`;

            res.status(201).header('Location', gifUrl).send({
                message: 'Video successfully converted to GIF!',
                gifUrl
            });
        })
        .on('error', err => {
            console.error('Error during conversion', err);
            res.status(500).json({ error: 'Error during conversion' });
        })
        .save(gifPath);
}
