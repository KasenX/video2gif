import express from 'express';
import uploadRoutes from './routes/upload';

const app = express();
const port = 3000;

app.use('/uploads', uploadRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
