import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { authenticateToken } from '../controllers/authController';
import { getVideos, uploadVideo, convertVideo } from '../controllers/videoController';

const router = express.Router();

router.use(fileUpload());
router.use('/', express.static(path.join(__dirname, '..', 'videos')));

router.get('/', authenticateToken, getVideos);

router.post('/', authenticateToken, uploadVideo);

router.post('/:videoName/convert', authenticateToken, convertVideo);

export default router;
