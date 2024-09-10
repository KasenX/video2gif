import { getDb } from '../db/connection';
import type { Preferences, NewPreferences, PreferencesUpdate } from '../db/schema';

export async function findPreferences(userId: number): Promise<Preferences | undefined> {
    return await getDb().selectFrom('preferences')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function createPreferences(userId: number, preferences: NewPreferences): Promise<Preferences> {
    return await getDb().insertInto('preferences')
    .values(preferences)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updatePreferences(userId: number, preferences: Partial<PreferencesUpdate>): Promise<Preferences> {
    return await getDb().updateTable('preferences')
    .set(preferences)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
