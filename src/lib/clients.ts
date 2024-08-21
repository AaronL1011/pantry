import type { Unsafe } from 'sveltekit-sse';
import { source } from 'sveltekit-sse';
export const clients: Map<string, (topic: string, data: string) => Unsafe<void, Error>> = new Map();
import { session } from './store';
import { get } from 'svelte/store';

export function messageClients(topic: string, message: string) {
	clients.forEach((emitter) => emitter(topic, message));
}

export const connection = source('/api/events', {
	options: {
		headers: {
			'session-id': get(session).session_id
		}
	}
});
