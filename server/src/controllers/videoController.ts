import { type Request, type Response } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export const uploadVideo = (req: Request, res: Response) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No video was uploaded.');
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const uniqueFileName = `${uuidv4()}${path.extname(file.name)}`;
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
            console.error(`Error during conversion: ${err.message}`);
            res.status(500).send('Error during conversion');
        })
        .save(gifPath);
}
