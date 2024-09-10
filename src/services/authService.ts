import jwt from 'jsonwebtoken';
import { JWTUserPayload } from '../types/types';

// TODO: implement user service
const users = [
    { id: 1, email: 'user@example.com', password: 'password123' },
    { id: 2, email: 'kuba.rone@gmail.com', password: '12345' }
];

export const generateAccessToken = (email: string, password: string): string | false => {
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return false;
    }

    return jwt.sign({ user }, process.env.AUTH_SECRET_KEY as string, { expiresIn: '1h' });
}

export const authenticateToken = (token: string): JWTUserPayload | false => {
    try {
        return jwt.verify(token, process.env.AUTH_SECRET_KEY as string) as JWTUserPayload;
    } catch (error) {
        return false;
    }
};
