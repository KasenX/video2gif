import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { uploadFile } from '../controllers/uploadController';

const router = express.Router();

router.use(fileUpload());
router.use('/', express.static(path.join(__dirname, '..', 'uploads')));

router.post('/', uploadFile);

export default router;
