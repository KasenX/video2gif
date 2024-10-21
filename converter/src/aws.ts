import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const pipelineAsync = promisify(pipeline);

const bucketName = 'n12134171-assessment';
const s3Client = new S3Client({ region: 'ap-southeast-2' });

export const storeVideoFile = async (videoId: string, videoExtension: string): Promise<string> => {
    const tempVideoPath = path.join(__dirname, '..', 'videos', `${videoId}.${videoExtension}`);
    
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `videos/${videoId}.${videoExtension}`,
        });
        
        const { Body } = await s3Client.send(command);

        if (!Body) {
            throw new Error('Failed to retrieve video file from S3');
        }

        await pipelineAsync(Body as NodeJS.ReadableStream, createWriteStream(tempVideoPath));
        
        return tempVideoPath;
    } catch (err) {
        console.error('Error storing video file', err);
        throw err;
    }
}

export const uploadGifFile = async (filePath: string, gifId: string): Promise<void> => {
    try {
        // Read the file from the local file system
        const fileStream = createReadStream(filePath);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `gifs/${gifId}.gif`,
            Body: fileStream,
            ContentType: 'image/gif',
        });

        await s3Client.send(command);
    } catch (err) {
        console.error('Error uploading file to S3', err);
        throw err;
    }
}
