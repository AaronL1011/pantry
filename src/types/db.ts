import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
export interface Database {
	item: ItemTable;
	recipe: RecipeTable;
	recipeItem: RecipeItemTable;
}

export type Isle =
	| 'asian'
	| 'canned goods'
	| 'fridge'
	| 'frozen'
	| 'grains'
	| 'health foods'
	| 'herbs and spices'
	| 'meats'
	| 'produce'
	| 'plant based';
export type ItemType = 'ingredient' | 'snack' | 'non-perishable' | 'drink' | 'other';
export interface ItemTable {
	id: Generated<number>;
	name: string;
	isle: string;
	type: ItemType;
	vegan: number;
	stocked: number;
	created_at: ColumnType<Date, string | undefined, never>;
}

export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;
export type ItemUpdate = Updateable<ItemTable>;

export interface RecipeTable {
	id: Generated<number>;
	name: string;
	link?: string;
	img?: Uint8Array;
	img_mime_type?: string;
	portions: number;
	isCooking: number;
	created_at: ColumnType<Date, string | undefined, never>;
}

export type Recipe = Selectable<RecipeTable>;
export type NewRecipe = Insertable<RecipeTable>;
export type RecipeUpdate = Updateable<RecipeTable>;

export type MeasurementUnit =
	| 'ml'
	| 'l'
	| 'kl'
	| 'tsp'
	| 'Tbs'
	| 'fl-oz'
	| 'cup'
	| 'pnt'
	| 'qt'
	| 'gal'
	| 'mcg'
	| 'mg'
	| 'g'
	| 'kg'
	| 'oz'
	| 'lb'
	| '';

export interface RecipeItemTable {
	id: Generated<number>;
	recipe_id: number;
	item_id: number;
	qty: number;
	unit: MeasurementUnit;
}

export type RecipeItem = Selectable<RecipeItemTable>;
export type NewRecipeItem = Insertable<RecipeItemTable>;
export type RecipeItemUpdate = Updateable<RecipeItemTable>;
