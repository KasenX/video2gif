import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = 'your_secret_key'; // TODO: env variable
const users = [
    { id: 1, email: 'user@example.com', password: 'password123' } // TODO: store in DB
];

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).send('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.send({ authToken: token });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('A token is required for authentication');
    }

    try {
        const user = jwt.verify(token, secretKey);
        req.user = user;
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
    return next();
};
