import type { Request, Response } from 'express';
import { updatePreferences as updatePreferencesDB } from '../repositories/preferencesRepository';
import { getPreferences as getPreferencesService } from '../services/preferencesService';

export const getPreferences = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    const preferences = await getPreferencesService(user.id);

    return res.status(200).json(preferences);
}

export const updatePreferences = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    const preferences = req.body;

    if (!preferences) {
        return res.status(400).json({ error: 'Request body is required' });
    }

    // Check if the user has preferences in the database
    await getPreferencesService(user.id);

    try {
        await updatePreferencesDB(user.id, preferences);
        return res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (err) {
        console.error('Failed to update preferences', err);
        return res.status(500).json({ error: 'Failed to update preferences' });
    }
}
