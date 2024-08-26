import type { Item, ItemUpdate, NewItem, NewRecipe, RecipeUpdate } from '../../types/db';
import { messageClients } from '../clients';

function toMessage(object: { type: string; data: object | string | number }): string {
	return JSON.stringify(object);
}

export function emitItemAddedEvent(item: NewItem) {
	messageClients(
		'item',
		toMessage({
			type: 'itemAdded',
			data: item
		})
	);
}

export function emitItemUpdatedEvent(item: ItemUpdate) {
	messageClients(
		'item',
		toMessage({
			type: 'itemUpdated',
			data: JSON.stringify(item)
		})
	);
}

export function emitItemDeletedEvent(itemId: Item['id']) {
	messageClients(
		'item',
		toMessage({
			type: 'itemDeleted',
			data: itemId.toString()
		})
	);
}

export function emitRecipeAddedEvent(recipe: NewRecipe) {
	messageClients(
		'recipe',
		toMessage({
			type: 'recipeAdded',
			data: JSON.stringify(recipe)
		})
	);
}

export function emitRecipeUpdatedEvent(recipe: RecipeUpdate) {
	messageClients(
		'recipe',
		toMessage({
			type: 'recipeUpdated',
			data: JSON.stringify(recipe)
		})
	);
}

export function emitRecipeDeletedEvent(recipe: { recipeId: number }) {
	messageClients(
		'recipe',
		toMessage({
			type: 'recipeDeleted',
			data: JSON.stringify(recipe)
		})
	);
}
