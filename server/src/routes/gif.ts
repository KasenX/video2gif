import express from 'express';
import { authenticateToken } from '../controllers/authController';
import { checkGifOwnership, getGif, getGifs } from '../controllers/gifController';

const router = express.Router();

router.get('/:gifId', authenticateToken, checkGifOwnership, getGif);

router.get('/', authenticateToken, getGifs);

export default router;
