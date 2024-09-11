import { Kysely } from 'kysely';
import type {
	Database,
	Isle,
	ItemType,
	MeasurementUnit,
	NewItem,
	NewRecipe,
	NewRecipeItem
} from '../types/db';
import type { Transaction } from 'kysely';
import itemsData from './items.json';
import recipeItemsData from './recipe_items.json';
import recipeData from './recipes.json';

export async function initializeTables(db: Kysely<Database>) {
	await db.schema
		.createTable('item')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull().unique())
		.addColumn('isle', 'text', (col) => col.notNull())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('stocked', 'boolean', (col) => col.notNull())
		.addColumn('vegan', 'boolean', (col) => col.notNull())
		.addColumn('created_at', 'text', (col) => col.notNull())
		.execute();

	await db.schema
		.createTable('recipe')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('link', 'text')
		.addColumn('portions', 'integer', (col) => col.notNull())
		.addColumn('isCooking', 'boolean', (col) => col.notNull())
		.addColumn('img', 'blob')
		.addColumn('img_mime_type', 'text')
		.addColumn('created_at', 'text', (col) => col.notNull())
		.execute();

	await db.schema
		.createTable('recipeItem')
		.ifNotExists()
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('item_id', 'integer', (col) => col.notNull())
		.addColumn('recipe_id', 'integer', (col) => col.notNull())
		.addColumn('unit', 'text', (col) => col.notNull())
		.addColumn('qty', 'integer', (col) => col.notNull())
		.addUniqueConstraint('recipe_item_unique_constraint', ['recipe_id', 'item_id'])
		.execute();
}

export async function seedData(db: Kysely<Database>) {
	await db.transaction().execute(async (txn) => {
		await seedItems(txn);
		await seedRecipes(txn);
	});
}

async function seedItems(txn: Transaction<Database>) {
	const items: NewItem[] = itemsData.map((item) => ({
		...item,
		name: item.name.toLowerCase(),
		type: item.type as ItemType,
		isle: item.isle as Isle,
		created_at: new Date().toISOString()
	}));

	await txn
		.insertInto('item')
		.values(items)
		.onConflict((oc) => oc.doNothing())
		.execute();
}

async function seedRecipes(txn: Transaction<Database>) {
	const recipes: NewRecipe[] = recipeData.map((recipe) => ({
		...recipe,
		name: recipe.name.toLowerCase(),
		link: recipe.link ?? undefined,
		created_at: new Date().toISOString()
	}));

	const recipeItems: NewRecipeItem[] = recipeItemsData.map((recipeItem) => ({
		...recipeItem,
		unit: recipeItem.unit as MeasurementUnit
	}));

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
