import { Kysely } from 'kysely';
import type { Database, NewItem, NewRecipe, NewRecipeItem } from '../types/db';
import type { Transaction } from 'kysely';

export async function initializeTables(db: Kysely<Database>) {
	await db.schema
		.createTable('item')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('isle', 'text', (col) => col.notNull())
		.addColumn('stocked', 'boolean', (col) => col.notNull())
		.addColumn('created_at', 'text', (col) => col.notNull()) // Assuming you'll store the date as a string
		.execute();

	await db.schema
		.createTable('recipe')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('link', 'text', (col) => col.notNull())
		.addColumn('isCooking', 'boolean', (col) => col.notNull())
		.execute();

	await db.schema
		.createTable('recipeItem')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('item_id', 'text', (col) => col.notNull())
		.addColumn('recipe_id', 'text', (col) => col.notNull())
		.addColumn('unit', 'text', (col) => col.notNull())
		.addColumn('qty', 'integer', (col) => col.notNull())
		.execute();
}

export async function seedData(db: Kysely<Database>) {
	await db.transaction().execute(async (txn) => {
		await seedItems(txn);
		await seedRecipes(txn);
	});
}

async function seedItems(txn: Transaction<Database>) {
	const items: NewItem[] = [
		{
			id: 0,
			name: 'almond milk',
			isle: 'health food',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 1,
			name: 'chickpeas',
			isle: 'canned goods',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 2,
			name: 'coconut milk',
			isle: 'asian',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 3,
			name: 'spinach',
			isle: 'produce',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 4,
			name: 'sweet potatoes',
			isle: 'produce',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 5,
			name: 'tofu',
			isle: 'plant based',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 6,
			name: 'quinoa',
			isle: 'health food',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 7,
			name: 'nutritional yeast',
			isle: 'health food',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 8,
			name: 'avocados',
			isle: 'produce',
			stocked: 0,
			created_at: new Date().toISOString()
		},
		{
			id: 9,
			name: 'brown rice',
			isle: 'grains',
			stocked: 0,
			created_at: new Date().toISOString()
		}
	];
	await txn
		.insertInto('item')
		.values(items)
		.onConflict((oc) => oc.doNothing())
		.execute();
}

async function seedRecipes(txn: Transaction<Database>) {
	const recipes: NewRecipe[] = [
		{
			id: 0,
			name: 'tofu bowl',
			link: 'https://google.com',
			isCooking: 0
		},
		{
			id: 1,
			name: 'chickpea curry',
			link: 'https://google.com',
			isCooking: 0
		}
	];

	const recipeItems: NewRecipeItem[] = [
		{
			recipe_id: 0,
			item_id: 4,
			qty: 2,
			unit: 'whole'
		},
		{
			recipe_id: 0,
			item_id: 5,
			qty: 1,
			unit: 'block'
		},
		{
			recipe_id: 0,
			item_id: 6,
			qty: 1,
			unit: 'cup'
		},
		{
			recipe_id: 0,
			item_id: 8,
			qty: 1,
			unit: 'whole'
		},
		{
			recipe_id: 1,
			item_id: 1,
			qty: 1,
			unit: 'can'
		},
		{
			recipe_id: 1,
			item_id: 2,
			qty: 1,
			unit: 'can'
		},
		{
			recipe_id: 1,
			item_id: 3,
			qty: 1,
			unit: 'bunch'
		},
		{
			recipe_id: 1,
			item_id: 9,
			qty: 1,
			unit: 'cup'
		}
	];

	await txn
		.insertInto('recipe')
		.values(recipes)
		.onConflict((oc) => oc.doNothing())
		.execute();
	await txn
		.insertInto('recipeItem')
		.values(recipeItems)
		.onConflict((oc) => oc.doNothing())
		.execute();
}
