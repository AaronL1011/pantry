import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const items = await db
		.selectFrom('item')
		.leftJoin('recipeItem', 'item.id', 'recipeItem.item_id')
		.select([
			'item.id',
			'item.name',
			'item.isle',
			'item.type',
			'item.stocked',
			'item.created_at',
			db.fn.count('recipeItem.item_id').as('recipeCount')
		])
		.groupBy('item.id')
		.execute();

	return {
		items
	};
};
