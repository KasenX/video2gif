import { Video, Gif } from '../../src/db/schema';
import { User } from '../types';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
        video?: Video;
        gif?: Gif;
    }
}
