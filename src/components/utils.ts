import type { Item } from '../types/db';

export const itemTypePillColor: { [key in Item['type']]: string } = {
	ingredient: 'bg-lime-700',
	'non-perishable': 'bg-yellow-700',
	snack: 'bg-orange-700',
	drink: 'bg-blue-700',
	other: 'bg-stone-700'
};
