import { db } from '../db/connection';
import type { Preferences, PreferencesUpdate } from '../db/schema';

export async function findPreferences(userId: number): Promise<Preferences | undefined> {
    return await db.selectFrom('preferences')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function updatePreferences(userId: number, preferences: Partial<PreferencesUpdate>): Promise<Preferences> {
    return await db.updateTable('preferences')
    .set(preferences)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
