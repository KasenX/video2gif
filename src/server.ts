import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import gifRoutes from './routes/gif';
import preferencesRoutes from './routes/preferences';
import webClientRoutes from './routes/webClient';
import { getSecrets, getParameters } from './utils/aws';
import { initializeDb } from './db/connection';

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
        const credentials = await getSecrets();
        const parameters = await getParameters();
        
        process.env.DB_USER = credentials.dbUser;
        process.env.DB_PASSWORD = credentials.dbPassword;
        process.env.DB_HOST = parameters.dbHost;
        process.env.DB_NAME = parameters.dbName;

        process.env.URL = parameters.url;

        initializeDb();

        app.listen(port, () => {
            console.log(`Server is running on url: http://${process.env.URL}:${port}`);
        });
    } catch (error) {
        console.error('Error starting the server', error);
    }
}

startServer();
