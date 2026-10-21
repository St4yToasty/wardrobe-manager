import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data: places, error: err } = await supabase
		.from('places')
		.select('id, name, kind, description')
		.order('sort');

	if (err) error(500, err.message);
	return { places: places ?? [] };
};
