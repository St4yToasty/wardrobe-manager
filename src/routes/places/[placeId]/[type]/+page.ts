import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();

	let items = supabase
		.from('items')
		.select('id, name, type, colour, brand, size, price, thumb_path, colours(hex)')
		.eq('place_id', params.placeId)
		.is('deleted_at', null)
		.order('added_on', { ascending: false });
	if (params.type !== 'all') items = items.eq('type', params.type);

	const [place, type, list] = await Promise.all([
		supabase.from('places').select('id, name').eq('id', params.placeId).maybeSingle(),
		params.type === 'all'
			? Promise.resolve({ data: { label: 'Everything' }, error: null })
			: supabase.from('clothing_types').select('label').eq('slug', params.type).maybeSingle(),
		items
	]);

	const err = place.error ?? type.error ?? list.error;
	if (err) error(500, err.message);
	if (!place.data || !type.data) error(404, 'Not found');

	return { place: place.data, typeLabel: type.data.label, items: list.data ?? [] };
};
