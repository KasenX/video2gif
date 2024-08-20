import type { Request, Response, NextFunction } from 'express';
import { validate } from 'uuid';
import path from 'path';
import { findGif, findGifs } from '../repositories/gifRepository';

export const checkGifOwnership = async (req: Request, res: Response, next: NextFunction) => {
    const gifId = req.params.gifId as string;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    if (!validate(gifId)) {
        return res.status(400).json({ error: 'Invalid gif ID' });
    }

    try {
        const gif = await findGif(gifId, userId);

        if (!gif) {
            return res.status(404).json({ error: 'Gif not found' });
        }

        req.gif = gif;

        next();
    } catch (err) {
        console.error('Error checking gif ownership:', err);
        return res.status(500).json({ error: 'Failed to gif video ownership' });
    }
}

export const getGif = (req: Request, res: Response) => {
    const gif = req.gif;

    if (!gif) {
        return res.status(400).json({ error: 'Failed to find the gif file' });
    }

    const gifPath = path.join(__dirname, '..', 'gifs', `${gif.id}${gif.extension}`);

    res.sendFile(gifPath, (err) => {
        if (err) {
            console.error('Error serving the gif file', err);
            res.status(500).json({ error: 'Failed to serve the gif file' });
        }
    });
}

export const getGifs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ error: 'Failed to find the user' });
        }

        const gifs = await findGifs(userId);

        return res.status(200).json({ gifs });
    } catch (err) {
        console.error('Error fetching gifs:', err);
        return res.status(500).json({ error: 'Failed to retrieve gifs' });
    }
};
