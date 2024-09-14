import type { Handle } from '@sveltejs/kit';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from './types/db'; // this is the Database interface we defined earlier
import { initializeTables, seedData } from './utils/db';

const dialect = new SqliteDialect({
	database: new SQLite('pantry.db')
});

const db = new Kysely<Database>({
	dialect
});

await initializeTables(db).catch((err) => {
	console.error('Failed to initialize tables:', err);
});

await seedData(db).catch((err) => {
	console.error('Failed to seed data:', err);
});

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.db) {
		event.locals.db = db;
	}

	const resp = await resolve(event);
	return resp;
};
