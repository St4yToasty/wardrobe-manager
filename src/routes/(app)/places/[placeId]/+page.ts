import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { wardrobe } = await parent();
	if (!wardrobe.places.some((p) => p.id === params.placeId)) error(404, 'Place not found');
};
