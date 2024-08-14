import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NewItem } from '../../../types/db';}

export const POST: RequestHandler = async ({ locals }) => {
	try {
		const db = locals.db;

		const newItem: NewItem = {
			name: 'Sugar',
			isle: 'something',
			stocked: 0,
			created_at: new Date().toISOString(),
		}

		await db
			.insertInto('item')
			.values(newItem)
			.execute();

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to make a new item');
	}
};
