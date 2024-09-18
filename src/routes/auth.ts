import express from 'express';
import { signUp, confirmSignUp, login } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.post('/confirm', confirmSignUp);
router.post('/login', login);

export default router;
