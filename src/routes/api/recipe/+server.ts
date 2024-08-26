import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NewRecipe, NewRecipeItem, RecipeUpdate } from '../../../types/db';
import {
	emitRecipeAddedEvent,
	emitRecipeUpdatedEvent,
	emitRecipeDeletedEvent
} from '$lib/server/events';

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = await request.json();

		const recipeUpdate: RecipeUpdate = {
			...updated
		};

		if (recipeUpdate.id === undefined) error(400, 'No recipe id provided for update');

		const res = await db
			.updateTable('recipe')
			.set(recipeUpdate)
			.where('recipe.id', '=', recipeUpdate.id)
			.execute();

		if (res.length > 0) {
			emitRecipeUpdatedEvent(recipeUpdate);
		}

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};

export type NewRecipeRequest = {
	name: string;
	link?: string;
	img?: string;
	img_mime_type?: string;
	portions: number;
	ingredients: Omit<NewRecipeItem, 'recipe_id'>[];
};

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const formData = await request.formData();
		const image = formData.get('image');
		const name = formData.get('name');
		const portions = formData.get('portions');
		const link = formData.get('link');

		if (!(Number(portions) > 0)) {
			error(400, 'Portions must be greater than 0');
		}

		const ingredientString = formData.get('ingredients');
		const ingredients = JSON.parse(ingredientString as string) as NewRecipeRequest['ingredients'];

		let imageBuffer;
		let mimeType;
		if (image) {
			imageBuffer = Buffer.from(await (image as File).arrayBuffer());
			mimeType = (image as File).type;
		}

		const newRecipe: NewRecipe = {
			name: name as string,
			link: link as string | undefined,
			portions: Number(portions),
			isCooking: 0,
			img: imageBuffer,
			img_mime_type: mimeType,
			created_at: new Date().toISOString()
		};

		const res = await db.insertInto('recipe').values(newRecipe).execute();

		if (!res[0].insertId) {
			error(400, 'Failed to create recipe');
		}

		const newRecipeItems: NewRecipeItem[] = ingredients.map((ingredient) => ({
			recipe_id: Number(res[0].insertId),
			item_id: ingredient.item_id,
			qty: ingredient.qty / Number(portions),
			unit: ingredient.unit
		}));

		await db.insertInto('recipeItem').values(newRecipeItems).execute();

		emitRecipeAddedEvent({ ...newRecipe, id: Number(res[0].insertId) });
		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = await request.json();

		const deleteRequest: { recipeId: number } = {
			...updated
		};

		if (deleteRequest.recipeId === undefined) error(400, 'No recipe id provided for update');

		const res = await db.transaction().execute(async (txn) => {
			const recipeItemRes = await txn
				.deleteFrom('recipeItem')
				.where('recipeItem.recipe_id', '=', deleteRequest.recipeId)
				.execute();
			const recipeRes = await txn
				.deleteFrom('recipe')
				.where('recipe.id', '=', deleteRequest.recipeId)
				.execute();
			return { recipeItemRes, recipeRes };
		});

		if (res.recipeRes.length > 0) emitRecipeDeletedEvent(deleteRequest);

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};
