import { error, redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

/** The whole wardrobe is small, so it is loaded once and kept in a client store. */
export const load: LayoutLoad = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session) redirect(303, '/login');

	const [places, types, colours, items] = await Promise.all([
		supabase.from('places').select('*').order('sort'),
		supabase.from('clothing_types').select('*').order('sort'),
		supabase.from('colours').select('*').order('sort'),
		supabase
			.from('items')
			.select('*')
			.is('deleted_at', null)
			.order('added_on', { ascending: false })
			.order('created_at', { ascending: false })
	]);

	const err = places.error ?? types.error ?? colours.error ?? items.error;
	if (err) error(500, err.message);

	return {
		wardrobe: {
			userId: session.user.id,
			places: places.data ?? [],
			types: types.data ?? [],
			colours: colours.data ?? [],
			items: items.data ?? []
		}
	};
};
