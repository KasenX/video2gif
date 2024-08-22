import express from 'express';
import path from 'path';
import { login } from '../controllers/webClientController';

const router = express.Router();

router.get('/login', login);

// TODO: Add auth middleware
router.use("/", express.static(path.join(__dirname, "../public")));

export default router;
