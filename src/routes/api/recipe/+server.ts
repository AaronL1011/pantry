import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NewRecipe, NewRecipeItem, RecipeUpdate } from '../../../types/db';

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = await request.json();

		const recipeUpdate: RecipeUpdate = {
			...updated
		};

		if (recipeUpdate.id === undefined) error(400, 'No recipe id provided for update');

		await db
			.updateTable('recipe')
			.set(recipeUpdate)
			.where('recipe.id', '=', recipeUpdate.id)
			.execute();

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};

type NewRecipeRequest = {
	name: string;
	link?: string;
	portions: number;
	ingredients: Omit<NewRecipeItem, "recipe_id">[]
}

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const newRecipeRequest = await request.json() as NewRecipeRequest;

		if (!(newRecipeRequest.portions > 0)) {
			error(400, 'Portions must be greater than 0');
		}

		const newRecipe: NewRecipe = {
			name: newRecipeRequest.name,
			link: newRecipeRequest.link,
			portions: newRecipeRequest.portions,
			isCooking: 0,
			created_at: new Date().toISOString()
		};

		const res = await db
			.insertInto('recipe')
			.values(newRecipe)
			.execute();

		if (!res[0].insertId) {
			error(400, 'Failed to create recipe');
		}

		const newRecipeItems: NewRecipeItem[] = newRecipeRequest.ingredients.map((ingredient) => ({
			recipe_id: res[0].insertId as unknown as number,
			item_id: ingredient.item_id,
			qty: ingredient.qty / newRecipeRequest.portions,
			unit: ingredient.unit
		}))

		await db
			.insertInto('recipeItem')
			.values(newRecipeItems)
			.execute();

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};
