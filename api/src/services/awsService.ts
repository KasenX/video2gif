import { createReadStream } from 'fs';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import type { AWSSecrets, AWSParameters } from "../types/types";
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const rdsSecretName = "rds!db-66386ae9-73e6-4fa5-b606-04437acebac0";
const secretClient = new SecretsManagerClient({
    region: "ap-southeast-2",
});

const bucketName = 'n12134171-assessment';
const s3Client = new S3Client({ region: 'ap-southeast-2' });

const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/n12134171-video2gif';
const sqsClient = new SQSClient({ region: 'ap-southeast-2' });

export const getSecrets = async (): Promise<AWSSecrets> => {
    try {
        const response = await secretClient.send(
            new GetSecretValueCommand({
                SecretId: rdsSecretName
            })
        );
  
        const rdsSecrets = response.SecretString ? JSON.parse(response.SecretString) : undefined;

        if (!rdsSecrets) {
            throw new Error("RDS SecretString is undefined");
        }

        return {
            dbUser: rdsSecrets.username,
            dbPassword: rdsSecrets.password
        };

    } catch (error) {
        console.error("Error retrieving secrets", error);
        throw error;
    }
}

const parametersNames = [
    '/n12134171/url',
    '/n12134171/rds/url',
    '/n12134171/rds/db_name'
];
const parameterClient = new SSMClient({
    region: "ap-southeast-2",
});

export const getParameters = async (): Promise<AWSParameters> => {
    try {
        const command = new GetParametersCommand({
            Names: parametersNames
        });
    
        const response = await parameterClient.send(command);
    
        if (!response.Parameters || response.Parameters.length !== 3) {
          throw new Error("Invalid number of parameters");
        }
    
        const params = response.Parameters.reduce((acc, param) => {
            if (!param.Name || !param.Value) {
                throw new Error("Invalid parameter");
            }

            acc[param.Name] = param.Value;
            return acc;
        }, {} as Record<string, string>);
    
        return {
            url: params['/n12134171/url'] as string,
            dbHost: params['/n12134171/rds/url'] as string,
            dbName: params['/n12134171/rds/db_name'] as string,
        };
    } catch (error) {
        console.error("Error retrieving parameters", error);
        throw error;
    }
}

export const uploadVideoFile = async (filePath: string, videoId: string, videoExtension: string): Promise<void> => {
    try {
        // Read the file from the local file system
        const fileStream = createReadStream(filePath);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `videos/${videoId}.${videoExtension}`,
            Body: fileStream,
            ContentType: `video/${videoExtension}`,
        });

        await s3Client.send(command);
    } catch (err) {
        console.error('Error uploading file to S3', err);
        throw err;
    }
}

export const generateVideoUrl = async (videoId: string, videoExtension: string): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `videos/${videoId}.${videoExtension}`,
        });

        // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err) {
        console.error('Error generating pre-signed URL', err);
        throw err;
    }
}

export const generateGifUrl = async (gifId: string): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `gifs/${gifId}.gif`,
        });

        // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err) {
        console.error('Error generating pre-signed URL', err);
        throw err;
    }
}

export const sendToQueue = async (gifId: string): Promise<void> => {
    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: gifId
    });

    await sqsClient.send(command);
}
