import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NewRecipeItem } from '../../../../types/db';

export type NewRecipeRequest = {
	name: string;
	link?: string;
	img?: Buffer;
	portions: number;
	ingredients: Omit<NewRecipeItem, "recipe_id">[]
}

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const db = locals.db;

        const id = url.searchParams.get('id')
		if (!id) {
            error(400, 'No id')
        }

		const res = await db.selectFrom('recipe').select(['img', 'img_mime_type']).where('id', '=', Number(id)).executeTakeFirst();
        if (!res?.img) {
            error(404, 'Recipe not found')
        }

        const imageBuffer = res.img as Buffer;
        const mimeType = res.img_mime_type;
		return new Response(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType ?? "image/jpg",
              'Content-Length': imageBuffer.length.toString(),
            },
          });
	} catch (e) {
		console.log(e);
		error(500, 'Failed to update recipe');
	}
};
