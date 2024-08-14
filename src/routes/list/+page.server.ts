import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const items = await db
		.selectFrom('item')
		.innerJoin('recipeItem', 'recipeItem.item_id', 'item.id')
		.innerJoin('recipe', 'recipe.id', 'recipeItem.recipe_id')
		.select([
			'item.id', // Select all columns from the item table
			'item.name',
			'item.isle',
			'recipeItem.qty', // Select qty from recipeItem
			'recipeItem.unit' // Select unit from recipeItem
		  ])
		.where('recipe.isCooking', '=', 1)
		.groupBy('item.id') // Group by item fields
		.execute();

	return {
		items
	};
};
