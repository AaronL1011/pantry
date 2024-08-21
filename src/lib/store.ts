import { nanoid } from 'nanoid';
import { writable } from 'svelte/store';

export const session = writable({
	session_id: nanoid()
});
