import { connection } from '$lib/clients';
import { invalidate, invalidateAll } from '$app/navigation';
import type { ItemUpdate } from '../types/db';
import { usePantryList, useShoppingList } from './store';

type Message = {
	type: string;
	data: unknown;
};

const itemEvents = connection.select('item');
const recipeEvents = connection.select('recipe');

export function registerEventStateHandlers() {
	itemEvents.subscribe((e: string) => {
		if (e === '') return;
		const event = JSON.parse(e) as Message;
		handleItemEvent(event);
	});

	recipeEvents.subscribe((e: string) => {
		if (e === '') return;
		const event = JSON.parse(e) as Message;
		handleRecipeEvent(event);
	});
}

function handleItemEvent(event: Message) {
	switch (event.type) {
		case 'itemAdded':
			invalidateAll();
			break;
		case 'itemUpdated':
			handleItemUpdatedEvent(JSON.parse(event.data as string) as ItemUpdate);
			break;
		case 'itemDeleted':
			invalidateAll();
			break;
		default:
			console.log('unknown event');
			break;
	}
}

function handleRecipeEvent(event: Message) {
	switch (event.type) {
		case 'recipeAdded':
		case 'recipeUpdated':
		case 'recipeDeleted':
		default:
			invalidateAll();
			break;
	}
}

async function handleItemUpdatedEvent(eventData: ItemUpdate) {
	useShoppingList.update((prev) => {
		return prev.map((item) => {
			if (item.id === eventData.id) {
				return { ...item, ...eventData };
			}
			return item;
		});
	});

	usePantryList.update((prev) => {
		return prev.map((item) => {
			if (item.id === eventData.id) {
				return { ...item, ...eventData };
			}
			return item;
		});
	});
}
