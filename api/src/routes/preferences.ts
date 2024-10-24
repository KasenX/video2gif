import express from 'express';
import { authenticateToken } from '../controllers/authController';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';

const router = express.Router();

router.get('/', authenticateToken, getPreferences);

router.put('/', authenticateToken, updatePreferences);

export default router;
