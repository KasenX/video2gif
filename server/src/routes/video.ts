import express from 'express';
import fileUpload from 'express-fileupload';
import { authenticateToken } from '../controllers/authController';
import { getVideo, checkVideoOwnership, getVideos, uploadVideo, convertVideo } from '../controllers/videoController';

const router = express.Router();

router.use(fileUpload());

router.get('/:videoId', authenticateToken, checkVideoOwnership, getVideo);

router.get('/', authenticateToken, getVideos);

router.post('/', authenticateToken, uploadVideo);

router.post('/:videoName/convert', authenticateToken, convertVideo);

export default router;
