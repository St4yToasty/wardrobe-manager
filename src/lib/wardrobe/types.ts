import type { Tables, TablesInsert, TablesUpdate, Enums } from '#lib/supabase/database.types.ts';

export type Place = Tables<'places'>;
export type PlaceKind = Enums<'place_kind'>;
export type ClothingType = Tables<'clothing_types'>;
export type Colour = Tables<'colours'>;
export type Item = Tables<'items'>;
export type NewItem = TablesInsert<'items'>;
export type ItemPatch = TablesUpdate<'items'>;
export type BrandUsage = { brand: string; uses: number };

/** Slugs of the clothing types seeded by the first migration, in display order. */
export const TYPE_SLUGS = [
	'tops',
	'bottoms',
	'outerwear',
	'shoes',
	'underwear',
	'sleepwear',
	'sportswear',
	'swimwear',
	'house',
	'accessories'
] as const;
export type TypeSlug = (typeof TYPE_SLUGS)[number];

/** Name of the private storage bucket holding item photos. */
export const PHOTO_BUCKET = 'item-photos';

/** Storage path for an item's photo: <user id>/<item id>/<file>. RLS checks the first folder. */
export function photoPath(
	ownerId: string,
	itemId: string,
	file: 'original' | 'thumb',
	ext = 'webp'
) {
	return `${ownerId}/${itemId}/${file}.${ext}`;
}
