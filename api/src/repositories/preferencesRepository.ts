import { getDb } from '../db/connection';
import type { Preferences, NewPreferences, PreferencesUpdate } from '../db/schema';

export const findPreferences = async (userId: string): Promise<Preferences | undefined> => {
    return await getDb().selectFrom('preferences')
    .selectAll()
    .where('userId', '=', userId)
    .executeTakeFirst();
}

export const createPreferences = async (userId: string, preferences: NewPreferences): Promise<Preferences> => {
    return await getDb().insertInto('preferences')
    .values(preferences)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export const updatePreferences = async (userId: string, preferences: Partial<PreferencesUpdate>): Promise<Preferences> => {
    return await getDb().updateTable('preferences')
    .set(preferences)
    .where('userId', '=', userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
