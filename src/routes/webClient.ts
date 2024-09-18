import express from 'express';
import path from 'path';
import { authenticateCookie } from '../controllers/authController';
import {
    signUpGet,
    signUpPost,
    confirmGet,
    confirmPost,
    loginGet,
    loginPost,
    logout,
    home,
    gallery,
    gif,
    profileGet,
    profilePost
} from '../controllers/webClientController';

const router = express.Router();

router.get('/signup', signUpGet);
router.post('/signup', signUpPost);
router.get('/confirm', confirmGet);
router.post('/confirm', confirmPost);
router.get('/login', loginGet);
router.post('/login', loginPost);
router.get('/logout', authenticateCookie, logout);
router.get('/gallery', authenticateCookie, gallery);
router.get('/gifs/:gifId', authenticateCookie, gif);
router.get('/profile', authenticateCookie, profileGet);
router.post('/profile', authenticateCookie, profilePost);
router.get('/', authenticateCookie, home);

router.use("/", express.static(path.join(__dirname, "../../public")));

export default router;
