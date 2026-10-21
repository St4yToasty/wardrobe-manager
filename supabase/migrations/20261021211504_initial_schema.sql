-- Wardrobe: initial data model
--
-- places          Where clothes are kept (Lisboa, Santarém). One row per place per user.
-- clothing_types  Fixed list of types (Tops, Bottoms, ...). Shared, read-only.
-- colours         Fixed colour palette used for drawings and colour detection. Shared, read-only.
-- items           One row per piece of clothing.
-- brand_usage     View: brands already used, ranked by how often (for brand suggestions).
-- item-photos     Private storage bucket: <user id>/<item id>/<file>
--
-- Every user-owned row carries owner_id and is locked down with row level security,
-- so the publishable key can safely live in the browser.

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared lookup tables
-- ---------------------------------------------------------------------------

create table public.clothing_types (
	slug      text primary key,
	label     text not null,
	label_pt  text not null,
	icon      text not null,          -- key into the drawing set in src/lib/wardrobe/icons.ts
	sort      smallint not null unique
);

insert into public.clothing_types (slug, label, label_pt, icon, sort) values
	('tops',        'Tops',          'Partes de cima',   'tee',     1),
	('bottoms',     'Bottoms',       'Partes de baixo',  'bottoms', 2),
	('outerwear',   'Outerwear',     'Casacos',          'coat',    3),
	('shoes',       'Shoes',         'Calçado',          'sneaker', 4),
	('underwear',   'Underwear',     'Roupa interior',   'boxer',   5),
	('sleepwear',   'Sleepwear',     'Pijamas',          'pyjama',  6),
	('sportswear',  'Sportswear',    'Roupa desportiva', 'tank',    7),
	('swimwear',    'Swimwear',      'Roupa de banho',   'swim',    8),
	('house',       'House clothes', 'Roupa de casa',    'hoodie',  9),
	('accessories', 'Accessories',   'Acessórios',       'beanie', 10);

create table public.colours (
	name     text primary key,
	name_pt  text not null,
	hex      text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
	sort     smallint not null unique
);

insert into public.colours (name, name_pt, hex, sort) values
	('White',    'Branco',   '#F4F3EF',  1),
	('Black',    'Preto',    '#262624',  2),
	('Grey',     'Cinzento', '#A3A19B',  3),
	('Charcoal', 'Antracite','#4A4A47',  4),
	('Navy',     'Azul-marinho', '#2C3A55', 5),
	('Indigo',   'Índigo',   '#3E4C6E',  6),
	('Blue',     'Azul',     '#8AA6C9',  7),
	('Beige',    'Bege',     '#D9CAB0',  8),
	('Brown',    'Castanho', '#7A5638',  9),
	('Olive',    'Verde-azeitona', '#6E6C46', 10),
	('Green',    'Verde',    '#53705A', 11),
	('Red',      'Vermelho', '#A6453C', 12);

alter table public.clothing_types enable row level security;
alter table public.colours        enable row level security;

create policy "Signed-in users can read clothing types"
	on public.clothing_types for select to authenticated using (true);
create policy "Signed-in users can read colours"
	on public.colours for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Places
-- ---------------------------------------------------------------------------

create type public.place_kind as enum ('flat', 'house');

create table public.places (
	id           uuid primary key default gen_random_uuid(),
	owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
	name         text not null check (length(btrim(name)) between 1 and 60),
	description  text,                                   -- e.g. "Rented apartment"
	kind         public.place_kind not null default 'flat', -- picks the home-screen drawing
	sort         smallint not null default 0,
	created_at   timestamptz not null default now(),
	unique (owner_id, name),
	unique (id, owner_id)                                -- target for the items composite key
);

create index places_owner_idx on public.places (owner_id, sort);

alter table public.places enable row level security;

create policy "Owners manage their places"
	on public.places for all to authenticated
	using (owner_id = (select auth.uid()))
	with check (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Items
-- ---------------------------------------------------------------------------

create table public.items (
	id          uuid primary key default gen_random_uuid(),
	owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
	place_id    uuid not null,
	type        text not null references public.clothing_types (slug) on update cascade,
	name        text not null check (length(btrim(name)) between 1 and 120),
	colour      text references public.colours (name) on update cascade,
	brand       text check (brand is null or length(btrim(brand)) between 1 and 80),
	size        text check (size is null or length(size) <= 20),
	price       numeric(10, 2) check (price is null or price >= 0),   -- euros
	notes       text check (notes is null or length(notes) <= 4000),
	photo_path  text,                  -- object path in the item-photos bucket
	thumb_path  text,                  -- small square version for grids
	added_on    date not null default current_date,  -- editable "date added"
	created_at  timestamptz not null default now(),
	updated_at  timestamptz not null default now(),
	deleted_at  timestamptz,           -- soft delete, so "remove" can be undone
	-- the place must belong to the same owner as the item
	foreign key (place_id, owner_id) references public.places (id, owner_id) on delete restrict
);

create index items_owner_place_type_idx on public.items (owner_id, place_id, type) where deleted_at is null;
create index items_owner_added_idx      on public.items (owner_id, added_on desc) where deleted_at is null;
create index items_name_trgm_idx        on public.items using gin (lower(name) extensions.gin_trgm_ops);

alter table public.items enable row level security;

create policy "Owners manage their items"
	on public.items for all to authenticated
	using (owner_id = (select auth.uid()))
	with check (owner_id = (select auth.uid()));

-- Tidy text fields on write: trim, turn blanks into null, keep updated_at current.
create function public.items_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.name  := btrim(new.name);
	new.brand := nullif(btrim(new.brand), '');
	new.size  := nullif(btrim(new.size), '');
	new.notes := nullif(btrim(new.notes), '');
	if tg_op = 'UPDATE' then
		new.updated_at := now();
	end if;
	return new;
end;
$$;

create trigger items_before_write
	before insert or update on public.items
	for each row execute function public.items_before_write();

-- ---------------------------------------------------------------------------
-- Brand suggestions: each brand once (most common spelling), ranked by use
-- ---------------------------------------------------------------------------

create view public.brand_usage
with (security_invoker = true) as
select
	mode() within group (order by brand) as brand,
	count(*)::int                         as uses,
	max(created_at)                       as last_used
from public.items
where brand is not null and deleted_at is null
group by owner_id, lower(brand);

-- ---------------------------------------------------------------------------
-- New users start with the two places
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.places (owner_id, name, description, kind, sort) values
		(new.id, 'Lisboa',   'Rented apartment', 'flat',  1),
		(new.id, 'Santarém', 'Parents'' house',  'house', 2);
	return new;
end;
$$;

-- only the trigger may run it, never a client through the API
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Photo storage: private bucket, each user only sees their own folder
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'item-photos', 'item-photos', false, 15728640,
	array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

create policy "Owners read their photos"
	on storage.objects for select to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners upload their photos"
	on storage.objects for insert to authenticated
	with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners replace their photos"
	on storage.objects for update to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners delete their photos"
	on storage.objects for delete to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
