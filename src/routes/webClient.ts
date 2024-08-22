import express from 'express';
import path from 'path';
import { authenticateCookie } from '../controllers/authController';
import { loginGet, loginPost, logout, home } from '../controllers/webClientController';

const router = express.Router();

router.get('/login', loginGet);
router.post('/login', loginPost);
router.post('/logout', authenticateCookie, logout);
router.get('/', authenticateCookie, home);

// TODO: Add auth middleware
// router.use("/", express.static(path.join(__dirname, "../public")));

export default router;
