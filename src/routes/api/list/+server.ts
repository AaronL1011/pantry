import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { type MeasurementUnit } from '../../../types/db';
import convert from 'convert-units';
import type { ListItem } from '$lib/store';
import { groupBy } from 'lodash-es';

const volumePossibilities = convert().possibilities('volume');
const massPossibilities = convert().possibilities('mass');

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const db = locals.db;

		const recipeItems = await db
			.selectFrom('item')
			.innerJoin('recipeItem', 'recipeItem.item_id', 'item.id')
			.innerJoin('recipe', 'recipe.id', 'recipeItem.recipe_id')
			.select([
				'item.id',
				'item.name',
				'item.isle',
				'item.stocked',
				'recipeItem.qty',
				'recipeItem.unit',
				'recipe.portions'
			])
			.where('recipe.isCooking', '=', 1)
			.orderBy('item.name', 'asc')
			.execute();
		// Define common units, e.g., 'g' for mass or 'ml' for volume
		const commonMassUnit: MeasurementUnit = 'g';
		const commonVolumeUnit = 'cup';

		// Group items by item ID
		const itemsMap: Record<string, ListItem> = {};

		recipeItems.forEach((row) => {
			const itemId = row.id;
			const itemName = row.name;
			const isle = row.isle;
			const rawQty = row.qty * row.portions;
			const unit = row.unit;

			let convertedQty;
			let finalUnit: MeasurementUnit;

			if (unit === '') {
				finalUnit = '';
				convertedQty = rawQty;
			} else if (massPossibilities.includes(unit)) {
				// Convert mass units
				convertedQty = convert(rawQty).from(unit).to(commonMassUnit);
				finalUnit = commonMassUnit;
			} else if (volumePossibilities.includes(unit)) {
				// Convert volume units
				convertedQty = convert(rawQty).from(unit).to(commonVolumeUnit);
				finalUnit = commonVolumeUnit;
			} else {
				throw new Error(`Unknown unit type: ${unit}`);
			}

			// Initialize or update the itemsMap
			if (!itemsMap[itemId]) {
				itemsMap[itemId] = {
					id: itemId,
					name: itemName,
					isle: isle,
					stocked: row.stocked,
					qty: {
						whole: 0, // Initialize whole unit sum
						commonUnit: 0, // Initialize common unit sum
						unitType: finalUnit // Store the type of common unit (g or ml)
					}
				};
			}

			// Sum the quantities in the appropriate category
			if (finalUnit === '') {
				itemsMap[itemId].qty.whole += convertedQty;
			} else {
				itemsMap[itemId].qty.commonUnit += Math.ceil(convertedQty);
			}

			if (itemsMap[itemId].qty.whole > 0 && itemsMap[itemId].qty.commonUnit > 0) {
				itemsMap[itemId].qty.unitType = finalUnit; // Set unitType to common unit
			}
		});

		// Convert the map back to an array for further use
		const items = Object.values(itemsMap);

		const res = JSON.stringify(items);

		return new Response(res);
	} catch (e) {
		console.log(e);
		error(500, 'Failed to get list');
	}
};
