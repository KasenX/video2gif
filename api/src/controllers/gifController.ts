import type { Request, Response, NextFunction } from 'express';
import { validate } from 'uuid';
import { findGif } from '../repositories/gifRepository';
import { getGifs as getGifsService } from '../services/gifService';
import { generateGifUrl } from '../services/awsService';

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

export const getGif = async (req: Request, res: Response) => {
    const gif = req.gif;

    if (!gif) {
        return res.status(400).json({ error: 'Failed to find the gif file' });
    }

    if (gif.status === 'new' || gif.status === 'in_progress') {
        return res.status(202).json({ message: 'Gif is still being processed. Please check back later.' });
    }

    if (gif.status === 'failed') {
        return res.status(410).json({ error: 'Gif processing failed. Please try initiating the processing again.' });
    }

    const preSignedUrl = await generateGifUrl(gif.id);
    res.redirect(preSignedUrl);
}

export const getGifs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ error: 'Failed to find the user' });
        }

        const gifs = await getGifsService(userId);

        return res.status(200).json({ gifs });
    } catch (err) {
        console.error('Error fetching gifs:', err);
        return res.status(500).json({ error: 'Failed to retrieve gifs' });
    }
};
