import jwt from 'jsonwebtoken';
import { JWTUserPayload } from '../types/types';

const secretKey = 'TODO'
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

    return jwt.sign({ user }, secretKey, { expiresIn: '1h' });
}

export const authenticateToken = (token: string): JWTUserPayload | false => {
    try {
        return jwt.verify(token, secretKey) as JWTUserPayload;
    } catch (error) {
        return false;
    }
};
