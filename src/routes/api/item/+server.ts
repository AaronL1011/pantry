import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ItemUpdate, NewItem } from '../../../types/db';
import { emitItemAddedEvent, emitItemDeletedEvent, emitItemUpdatedEvent } from '$lib/server/events';

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const updated = await request.json();

		const itemUpdate: ItemUpdate = {
			...updated
		};

		if (itemUpdate.id === undefined) error(400, 'No item id provided for update');

		const res = await db
			.updateTable('item')
			.set(itemUpdate)
			.where('item.id', '=', itemUpdate.id)
			.execute();

		if (res.length > 0) {
			emitItemUpdatedEvent(itemUpdate);
		}
		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update item');
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const db = locals.db;
		const body = (await request.json()) as NewItem;
		const created_at = new Date().toISOString();
		const newItem: NewItem = {
			name: body.name.toLowerCase(),
			type: body.type,
			isle: body.isle,
			stocked: body.stocked,
			vegan: body.vegan,
			created_at
		};

		const res = await db
			.insertInto('item')
			.values(newItem)
			.onConflict((oc) => oc.doNothing())
			.execute();

		if (res.length > 0) {
			emitItemAddedEvent({ ...newItem, id: Number(res[0].insertId) });
		}

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
			await txn
				.deleteFrom('recipeItem')
				.where('recipeItem.item_id', '=', deleteTarget.id)
				.execute();
			const res = await txn.deleteFrom('item').where('item.id', '=', deleteTarget.id).execute();
			if (res.length > 0) {
				emitItemDeletedEvent(deleteTarget.id);
			}
		});

		return new Response(String('success'));
	} catch (e) {
		console.log(e);
		error(500, 'Failed to delete item');
	}
};
