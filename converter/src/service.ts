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

    const video = await findVideo(gif.video_id);

    if (!video) {
        console.error(`Video with ID ${gif.video_id} not found`);
        return;
    }

    const videoPath = await storeVideoFile(video.id, video.extension);

    await convertVideoToGif(gif, videoPath);
};

const convertVideoToGif = async (gif: Gif, videoPath: string) => {
    const gifPath = path.join(__dirname, '..', 'gifs', `${gif.id}.gif`);

    try {
        const ffmpegCommmand = ffmpeg(videoPath)
            .setStartTime(gif.startTime)
            .outputOptions([
                '-vf', `fps=${gif.fps},scale=${gif.scale_x}:${gif.scale_y}:flags=lanczos`
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
        })
        .on('error', async (err) => {
            await updateGif(gif.id, {
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
