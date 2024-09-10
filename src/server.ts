import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import gifRoutes from './routes/gif';
import preferencesRoutes from './routes/preferences';
import webClientRoutes from './routes/webClient';
import { getDatabaseCredentials } from './utils/aws';
import { db } from './db/connection';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/gifs', gifRoutes);
app.use('/api/preferences', preferencesRoutes);

app.use('/', webClientRoutes);

async function startServer() {
    try {
        const credentials = await getDatabaseCredentials();

        process.env.DB_USER = credentials.username;
        process.env.DB_PASSWORD = credentials.password;
        process.env.DB_HOST = 'n12134171-assessment.ce2haupt2cta.ap-southeast-2.rds.amazonaws.com';
        process.env.DB_NAME = 'video2gif';

        await db;

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting the server', error);
    }
}

startServer();
