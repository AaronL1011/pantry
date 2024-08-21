import { connection } from '$lib/clients';

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
		case 'itemUpdated':
		case 'itemDeleted':
		default:
			console.log(event);
			break;
	}
}

function handleRecipeEvent(event: Message) {
	switch (event.type) {
		case 'recipeAdded':
		case 'recipeUpdated':
		default:
			console.log(event);
			break;
	}
}
