import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type Database, type MeasurementUnit } from '../../../types/db';
import convert, { type Mass, type Volume } from 'convert-units';
import type { ListItem } from '$lib/store';
import type { Kysely } from 'kysely';

const volumePossibilities = convert().possibilities('volume');
const massPossibilities = convert().possibilities('mass');

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const db = locals.db;

		// Fetch data from the database
		const recipeItems = await fetchRecipeItems(db);

		// Process the fetched data to calculate quantities and group by item ID
		const items = processRecipeItems(recipeItems);

		// Convert the processed items to a JSON string for the response
		const res = JSON.stringify(items);

		return new Response(res);
	} catch (e) {
		console.error('Failed to get list:', e);
		return new Response('Failed to get list', { status: 500 });
	}
};

async function fetchRecipeItems(db: Kysely<Database>): Promise<any[]> {
	return await db
		.selectFrom('item')
		.leftJoin('recipeItem', 'recipeItem.item_id', 'item.id')
		.leftJoin('recipe', 'recipe.id', 'recipeItem.recipe_id')
		.select([
			'item.id',
			'item.name',
			'item.isle',
			'item.stocked',
			'recipeItem.qty',
			'recipeItem.unit',
			'recipe.portions'
		])
		.where(({ or, and, eb }) =>
			or([
				and([
					eb('item.type', '=', 'ingredient'),
					eb('recipe.isCooking', '=', 1)
				]),
				and([
					eb('item.type', 'in', ['drink', 'non-perishable', 'other', 'snack']),
					eb('item.stocked', '=', 0)
				])
			])
		)
		.orderBy('item.name', 'asc')
		.execute();
}

function processRecipeItems(recipeItems: any[]): ListItem[] {
	const commonMassUnit: MeasurementUnit = 'g';
	const commonVolumeUnit: MeasurementUnit = 'cup';

	// Group items by item ID
	const itemsMap: Record<string, ListItem> = {};

	recipeItems.forEach((row) => {
		const itemId = row.id;
		const itemName = row.name;
		const isle = row.isle;
		const rawQty = row.qty ? row.qty * (row.portions ?? 1) : null;
		const unit = row.unit ?? '';

		if (rawQty !== null) {
			const convertedQty = convertQuantity(rawQty, unit, commonMassUnit, commonVolumeUnit);

			// Initialize or update the itemsMap
			if (!itemsMap[itemId]) {
				itemsMap[itemId] = createListItem(itemId, itemName, isle, row.stocked, unit);
			}

			// Sum the quantities in the appropriate category
			updateListItemQuantity(itemsMap[itemId], unit, convertedQty, commonMassUnit, commonVolumeUnit);
		} else {
			// Handle non-ingredient items (no qty and unit)
			if (!itemsMap[itemId]) {
				itemsMap[itemId] = {
					id: itemId,
					name: itemName,
					isle: isle,
					stocked: row.stocked,
					vegan: 0,
					qty: {
						whole: 0,
						commonUnit: 0,
						unitType: ''
					}
				};
			}
		}
	});

	return Object.values(itemsMap)
};
function convertQuantity(
	rawQty: number,
	unit: MeasurementUnit,
	commonMassUnit: Mass,
	commonVolumeUnit: Volume
): number {
	if (unit === '') {
		return rawQty;
	} else if (massPossibilities.includes(unit)) {
		return convert(rawQty).from(unit).to(commonMassUnit);
	} else if (volumePossibilities.includes(unit)) {
		return convert(rawQty).from(unit).to(commonVolumeUnit);
	} else {
		throw new Error(`Unknown unit type: ${unit}`);
	}
}

function createListItem(
	itemId: number,
	itemName: string,
	isle: string,
	stocked: number,
	unit: MeasurementUnit
): ListItem {
	return {
		id: itemId,
		name: itemName,
		isle: isle,
		stocked: stocked,
		vegan: 0,
		qty: {
			whole: 0, // Initialize whole unit sum
			commonUnit: 0, // Initialize common unit sum
			unitType: unit // Store the type of common unit (g or ml)
		}
	};
}

function updateListItemQuantity(
	listItem: ListItem,
	unit: MeasurementUnit,
	convertedQty: number,
	commonMassUnit: MeasurementUnit,
	commonVolumeUnit: MeasurementUnit
): void {
	if (unit === '') {
		listItem.qty.whole += convertedQty;
	} else {
		listItem.qty.commonUnit += Math.ceil(convertedQty);
		listItem.qty.unitType = massPossibilities.includes(unit) ? commonMassUnit : commonVolumeUnit;
	}

	if (listItem.qty.whole > 0 && listItem.qty.commonUnit > 0) {
		listItem.qty.unitType = listItem.qty.unitType; // Set unitType to common unit
	}
}
