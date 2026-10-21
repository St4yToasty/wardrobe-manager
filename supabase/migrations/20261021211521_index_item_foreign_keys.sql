-- Covering indexes for the item foreign keys (flagged by the Supabase performance advisor).
create index items_colour_idx on public.items (colour);
create index items_type_idx on public.items (type);
create index items_place_owner_idx on public.items (place_id, owner_id);
