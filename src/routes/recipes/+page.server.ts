import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const db = locals.db;

	const recipes = await db
		.selectFrom('recipe')
		.select(['id', 'name', 'link', 'created_at', 'isCooking', 'portions', 'img_mime_type'])
		.orderBy('name', 'asc')
		.execute();

	// Get the ingredients for each recipe
	const recipeingredients = await db
		.selectFrom('recipeItem')
		.innerJoin('item', 'recipeItem.item_id', 'item.id')
		.select(['recipeItem.recipe_id', 'item.name', 'recipeItem.unit', 'recipeItem.qty', 'item.id'])
		.orderBy('name', 'asc')
		.execute();

	// Combine recipes with their ingredients
	const recipesWithingredients = recipes.map((recipe) => ({
		...recipe,
		ingredients: recipeingredients
			.filter((ri) => ri.recipe_id === recipe.id)
			.map((ri) => ({ name: ri.name, unit: ri.unit, qty: ri.qty, id: ri.id }))
	}));

	const items = await db
		.selectFrom('item')
		.selectAll()
		.where('item.type', 'in', ['ingredient', 'non-perishable'])
		.orderBy('name', 'asc')
		.execute();

	return {
		recipes: recipesWithingredients,
		items
	};
};
