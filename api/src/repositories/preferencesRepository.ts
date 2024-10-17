import { getDb } from '../db/connection';
import type { Preferences, NewPreferences, PreferencesUpdate } from '../db/schema';

export async function findPreferences(userId: string): Promise<Preferences | undefined> {
    return await getDb().selectFrom('preferences')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function createPreferences(userId: string, preferences: NewPreferences): Promise<Preferences> {
    return await getDb().insertInto('preferences')
    .values(preferences)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updatePreferences(userId: string, preferences: Partial<PreferencesUpdate>): Promise<Preferences> {
    return await getDb().updateTable('preferences')
    .set(preferences)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
