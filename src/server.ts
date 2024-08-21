import express from 'express';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import gifRoutes from './routes/gif';
import preferencesRoutes from './routes/preferences';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/gifs', gifRoutes);
app.use('/preferences', preferencesRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
