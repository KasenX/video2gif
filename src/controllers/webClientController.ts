import type { Request, Response } from 'express';
import path from 'path';

export const login = (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
};
