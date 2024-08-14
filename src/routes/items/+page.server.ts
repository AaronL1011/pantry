import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const items = await db.selectFrom('item').selectAll().execute();

	return {
		items
	};
};
