import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RecipeUpdate } from '../../../types/db';

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
		error(500, 'Failed to make a new item');
	}
};
