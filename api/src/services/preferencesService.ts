import { createPreferences as createPreferencesDB, findPreferences } from '../repositories/preferencesRepository';

export const getPreferences = async (userId: string) => {
    const preferences = await findPreferences(userId);

    // User does not have preferences yet, create them
    if (!preferences) {
        await createPreferences(userId);
        const preferences = await findPreferences(userId);

        if (!preferences) {
            console.error('Failed to create preferences');
            throw new Error('Failed to create preferences');
        }
        return preferences;
    }

    return preferences;
}

const createPreferences = async (userId: string) => {
    await createPreferencesDB(userId, {
        user_id: userId,
        fps: 10,
        scale_x: 320,
        scale_y: -1,
        updated: new Date()
    });
}
