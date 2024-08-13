import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { verifyToken } from '../controllers/authController';
import { uploadVideo, convertVideo } from '../controllers/videoController';

const router = express.Router();

router.use(fileUpload());
router.use('/', express.static(path.join(__dirname, '..', 'videos')));

router.post('/', verifyToken, uploadVideo);

router.post('/:videoName/convert', verifyToken, convertVideo);

export default router;
