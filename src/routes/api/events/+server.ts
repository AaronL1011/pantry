import { clients } from '$lib/clients';
import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	return produce(
		function start({ emit }) {
			const sessionId = request.headers.get('session-id') ?? '';
			if (!sessionId) {
				return function stop() {
					console.error('Client session id not found.');
				};
			}

			console.log('connecting', sessionId);
			clients.set(sessionId, emit);
		},
		{
			stop() {
				const sessionId = request.headers.get('session-id') ?? '';
				if (!sessionId) {
					return;
				}
				console.log('removing session', sessionId);
				clients.delete(sessionId);
			}
		}
	);
};
