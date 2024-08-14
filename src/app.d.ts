// See https://kit.svelte.dev/docs/types#app

import type { Kysely } from 'kysely';
import type { Database } from './types/db';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: Kysely<Database>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
