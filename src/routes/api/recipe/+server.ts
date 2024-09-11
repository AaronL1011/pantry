import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NewRecipe, NewRecipeItem, RecipeItemUpdate, RecipeUpdate } from '../../../types/db';
import {
	emitRecipeAddedEvent,
	emitRecipeUpdatedEvent,
	emitRecipeDeletedEvent
} from '$lib/server/events';

export const GET: RequestHandler = async ({ locals, request, url }) => {
	try {
		const id = url.searchParams.get('id');

		return new Response(JSON.stringify({ options: [] }));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to get recipe');
	}
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = (await request.json()) as RecipeUpdate & { ingredients: RecipeItemUpdate[] };

		const { ingredients, ...rest } = updated;

		if (rest.id === undefined) error(400, 'No recipe id provided for update');

		const res = await db.updateTable('recipe').set(rest).where('recipe.id', '=', rest.id).execute();

		if (res.length > 0) {
			emitRecipeUpdatedEvent(rest);
		}

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};

export type NewRecipeRequest = {
	id?: number;
	name: string;
	link?: string;
	img?: string;
	img_mime_type?: string;
	portions: number;
	ingredients: Omit<NewRecipeItem, 'recipe_id'>[];
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const db = locals.db;

	try {
		const formData = await request.formData();
		const id = formData.get('id') as unknown as number;
		const image = formData.get('image') as File | null;
		const name = formData.get('name') as string;
		const portions = Number(formData.get('portions'));
		const link = formData.get('link') as string | undefined;
		const ingredientString = formData.get('ingredients') as string;
		const ingredients = JSON.parse(ingredientString) as NewRecipeRequest['ingredients'];

		if (!(portions > 0)) {
			throw error(400, 'Portions must be greater than 0');
		}

		let imageBuffer: Buffer | undefined;
		let mimeType: string | undefined;
		if (image) {
			imageBuffer = Buffer.from(await image.arrayBuffer());
			mimeType = image.type;
		}

		const newRecipe: NewRecipe = {
			id,
			name,
			link,
			portions,
			isCooking: 0,
			img: imageBuffer,
			img_mime_type: mimeType,
			created_at: new Date().toISOString()
		};

		const result = await db.transaction().execute(async (trx: any) => {
			// Upsert the recipe
			const upsertedRecipe = await trx
				.insertInto('recipe')
				.values(newRecipe)
				.onConflict((oc: any) =>
					oc.column('id').doUpdateSet((eb: any) => ({
						name: eb.ref('excluded.name'),
						link: eb.ref('excluded.link'),
						portions: eb.ref('excluded.portions'),
						img: eb.ref('excluded.img'),
						img_mime_type: eb.ref('excluded.img_mime_type'),
						isCooking: eb.ref('excluded.isCooking')
					}))
				)
				.returningAll()
				.executeTakeFirstOrThrow();

			// Delete existing recipe items
			await trx.deleteFrom('recipeItem').where('recipe_id', '=', upsertedRecipe.id).execute();

			// Insert new recipe items
			const newRecipeItems: NewRecipeItem[] = ingredients.map((ingredient) => ({
				recipe_id: upsertedRecipe.id,
				item_id: ingredient.item_id,
				qty: ingredient.qty / portions,
				unit: ingredient.unit
			}));

			await trx.insertInto('recipeItem').values(newRecipeItems).execute();

			return upsertedRecipe;
		});

		if (result.numInsertedOrUpdatedRows === 1) {
			emitRecipeAddedEvent(result);
		} else {
			emitRecipeUpdatedEvent(result);
		}

		return new Response('success');
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to upsert recipe');
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
