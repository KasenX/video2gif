import express from 'express';
import path from 'path';
import { loginGet, loginPost, logout } from '../controllers/webClientController';

const router = express.Router();

router.get('/login', loginGet);
router.post('/login', loginPost);
router.post('/logout', logout);

// TODO: Add auth middleware
router.use("/", express.static(path.join(__dirname, "../public")));

export default router;
