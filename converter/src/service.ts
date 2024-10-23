import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { findVideo, findGif, updateGif } from './repository';
import { storeVideoFile, uploadGifFile } from './aws';
import { Gif } from './db/schema';

export const processConvertRequest = async (gifId: string) => {
    const gif = await findGif(gifId);

    if (!gif) {
        console.error(`Gif with ID ${gifId} not found`);
        return;
    }

    const video = await findVideo(gif.videoId);

    if (!video) {
        console.error(`Video with ID ${gif.videoId} not found`);
        return;
    }

    const videoPath = await storeVideoFile(video.id, video.extension);

    await convertVideoToGif(gif, videoPath);
};

const convertVideoToGif = async (gif: Gif, videoPath: string) => {
    const gifPath = path.join(__dirname, '..', 'gifs', `${gif.id}.gif`);

    return new Promise<void>((resolve, reject) => {
        try {
            const ffmpegCommmand = ffmpeg(videoPath)
                .setStartTime(gif.startTime)
                .outputOptions([
                    '-vf', `fps=${gif.fps},scale=${gif.scaleX}:${gif.scaleY}:flags=lanczos`
                ]);

            if (gif.duration) {
                ffmpegCommmand.duration(gif.duration);
            }

            ffmpegCommmand
            .on('end', async () => {
                // Upload the gif file to S3
                await uploadGifFile(gifPath, gif.id);

                await updateGif(gif.id, {
                    size: fs.statSync(gifPath).size,
                    status: 'completed',
                    completed: new Date(),
                });

                // Delete the video and gif file from the local file system
                fs.unlinkSync(videoPath);
                fs.unlinkSync(gifPath);

                // Resolve the promise when the conversion is successful
                resolve();
            })
            .on('error', async (err) => {
                await updateGif(gif.id, {
                    status: 'failed',
                    completed: new Date()
                });
                throw err;
            })
            .save(gifPath);
        } catch (err) {
            console.error('Error during conversion', err);
            // Reject the promise for unexpected errors
            reject(err);
        }
    });
};
