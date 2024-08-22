import type { Request, Response, NextFunction } from 'express';
import type { JWTUserPayload } from '../types/types';
import jwt from 'jsonwebtoken';

const secretKey = 'your_secret_key'; // TODO: env variable
const users = [
    { id: 1, email: 'user@example.com', password: 'password123' }, // TODO: store in DB
    { id: 2, email: 'kuba.rone@gmail.com', password: '12345' }
];

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ user }, secretKey, { expiresIn: '1h' });
    res.json({ authToken: token });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'A token is required for authentication' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = (decoded as JWTUserPayload).user;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    return next();
};
