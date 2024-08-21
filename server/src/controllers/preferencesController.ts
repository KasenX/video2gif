import type { Request, Response } from 'express';
import { findPreferences, updatePreferences as updatePreferencesDB } from '../repositories/preferencesRepository';

export const getUserPreferences = async (user_id: number) => {
    return await findPreferences(user_id);
}

export const getPreferences = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({ error: 'Failed to find the user' });
    }

    const preferences = await getUserPreferences(user.id);

    // Should not happen - every user should have preferences in the DB
    if (!preferences) {
        console.log('Preferences do not exist for user:', user.id);
        return res.status(500).json({ error: 'An unexpected error occured while trying to get user\'s preferences.' });
    }

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

    try {
        await updatePreferencesDB(user.id, preferences);
        return res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (err) {
        console.error('Failed to update preferences', err);
        return res.status(500).json({ error: 'Failed to update preferences' });
    }
}
