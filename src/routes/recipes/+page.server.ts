import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const recipes = await db.selectFrom('recipe').selectAll().execute();

	return {
		recipes
	};
};
