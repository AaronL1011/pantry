import { nanoid } from 'nanoid';
import { writable } from 'svelte/store';
import type { Item, MeasurementUnit } from '../types/db';
export const session = writable({
	session_id: nanoid()
});

export interface ListItem extends Omit<Item, 'type' | 'created_at'> {
	qty: {
		whole: number;
		commonUnit: number;
		unitType: MeasurementUnit;
	};
}
export const useShoppingList = writable<ListItem[]>([]);

export type PantryItem = Item & { recipeCount: number };
export const usePantryList = writable<PantryItem[]>([]);
