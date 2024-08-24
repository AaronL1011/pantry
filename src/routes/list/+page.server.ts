import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/list');

	if (!res.ok) {
		return {
			items: []
		};
	}

	const items = await res.json();
	return {
		items
	};
};
