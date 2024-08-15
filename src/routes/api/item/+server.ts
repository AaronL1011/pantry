import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ItemUpdate, NewItem } from '../../../types/db';

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = await request.json();

		const itemUpdate: ItemUpdate = {
			...updated
		};

		if (itemUpdate.id === undefined) error(400, 'No item id provided for update');

		await db.updateTable('item').set(itemUpdate).where('item.id', '=', itemUpdate.id).execute();

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update item');
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const newItem = (await request.json()) as NewItem;

		await db
			.insertInto('item')
			.values(newItem)
			.onConflict((oc) => oc.doNothing())
			.execute();

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update item');
	}
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const deleteTarget = (await request.json()) as { id: number };

        await db.transaction().execute(async (txn) => {
            await txn.deleteFrom('recipeItem').where('recipeItem.item_id', '=', deleteTarget.id).execute();
            await txn.deleteFrom('item').where('item.id', '=', deleteTarget.id).execute();
        })

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to delete item');
	}
};
