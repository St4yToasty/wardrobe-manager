import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();

	const [place, types] = await Promise.all([
		supabase.from('places').select('id, name, kind').eq('id', params.placeId).maybeSingle(),
		supabase.from('clothing_types').select('slug, label, icon').order('sort')
	]);

	if (place.error || types.error) error(500, (place.error ?? types.error)!.message);
	if (!place.data) error(404, 'Place not found');

	return { place: place.data, types: types.data ?? [] };
};
