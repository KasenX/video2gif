import type { Request, Response, NextFunction } from 'express';
import { generateAccessToken, authenticateToken as authenticateTokenService } from '../services/authService';

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const token = generateAccessToken(email, password);

    if (!token) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    res.json({ authToken: token });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'A token is required for authentication' });
    }

    const decoded = authenticateTokenService(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded.user;

    return next();
};
