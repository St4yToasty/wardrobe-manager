import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { wardrobe } = await parent();
	const placeOk = wardrobe.places.some((p) => p.id === params.placeId);
	const typeOk = params.type === 'all' || wardrobe.types.some((t) => t.slug === params.type);
	if (!placeOk || !typeOk) error(404, 'Not found');
};
