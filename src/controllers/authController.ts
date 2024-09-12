import type { Request, Response, NextFunction } from 'express';
import { generateAccessToken, authenticateToken as authenticateTokenService } from '../services/authService';
import { signUp as signUpService, confirmSignUp as confirmSignUpService } from '../services/authService';

export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    await signUpService(email, password);

    res.json({ message: 'User created' });
}

export const confirmSignUp = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    await confirmSignUpService(email, code);

    res.json({ message: 'User confirmed' });
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const token = await generateAccessToken(email, password);

    if (!token) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    res.json({ authToken: token });
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'A token is required for authentication' });
    }

    const decoded = await authenticateTokenService(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;

    return next();
};

export const authenticateCookie = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).redirect('/login');
    }

    const decoded = await authenticateTokenService(token);

    if (!decoded) {
        return res.status(401).redirect('/login');
    }

    req.user = decoded;

    return next();
}
