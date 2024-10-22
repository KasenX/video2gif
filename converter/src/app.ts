import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { getSecrets, getParameters } from './aws';
import { initializeDb } from './db/connection';
import { processConvertRequest } from './service';

const client = new SQSClient({ region: 'ap-southeast-2' });
const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/n12134171-video2gif';

const receiveMessage = async () => {
    const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 30
    });

    const response = await client.send(receiveCommand);
    // No messages in the queue -> continue polling
    if (!response.Messages || !response.Messages[0] || !response.Messages[0].Body) {
        console.log('No messages in the queue');
        return;
    }

    const gifId = response.Messages[0].Body;

    console.log(`Processing request for gifId: ${gifId}`);

    await processConvertRequest(gifId);

    console.log(`Request for gifId: ${gifId} processed`);

    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: response.Messages[0].ReceiptHandle
    });

    await client.send(deleteCommand);
}

const main = async () => {
    try {
        const credentials = await getSecrets();
        const parameters = await getParameters();

        initializeDb(parameters.dbHost, parameters.dbName, credentials.dbUser, credentials.dbPassword);
    } catch (error) {
        console.error('Error initializing the converter', error);
        return;
    }

    while (true) {
        await receiveMessage();
    }
}

main();
