# Wardrobe

A personal inventory of the clothes I own, across Lisboa and Santarém, usable from phone and computer.
Main use: when shopping, check "do I already own this?".

Stack: SvelteKit 3 (Svelte 5, TypeScript) + Supabase (Postgres, Auth, Storage).
Visual reference: the "Wardrobe" design canvas on claude.ai.

## Run it

```sh
npm install
npm run dev -- --open
```

`.env` holds the Supabase URL and publishable key (see `.env.example`). The publishable key is
meant for the browser: row level security keeps each user to their own rows.

## Project layout

```
src/
  env.ts                        declares the PUBLIC_SUPABASE_* variables ($app/env/public)
  hooks.server.ts               per-request Supabase client, session check, sign-in guard
  app.css                       design tokens + base styles (from the design canvas)
  lib/
    supabase/database.types.ts  generated types (npm run db:types)
    wardrobe/types.ts           app-level types (Place, Item, ...) and storage path helper
    wardrobe/icons.ts           line drawings + iconFor(item): name-specific shape or type default
    wardrobe/format.ts          euro(), plural()
    components/PlaceDrawing.svelte
  routes/
    login/                      email + password sign-in
    logout/                     POST to sign out
    +page                       home: the two places
    places/[placeId]/           clothing-type squares + Everything
    places/[placeId]/[type]/    items of one type (or "all") in a place
supabase/
  config.toml
  migrations/                   the schema, applied to the hosted project
```

## Data model

| Table / object   | What it holds                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `places`         | Where clothes are kept. New users get Lisboa (flat) and Santarém (house).                                                 |
| `clothing_types` | Tops, Bottoms, Outerwear, Shoes, Underwear, Sleepwear, Sportswear, Swimwear, House clothes, Accessories (EN + PT labels). |
| `colours`        | The 12-colour palette used for drawings and colour detection (EN + PT names).                                             |
| `items`          | name, type, colour, brand, size, price (€), place, notes, photo/thumb paths, added_on, soft-delete `deleted_at` for undo. |
| `brand_usage`    | View: each brand once, with how often it's used, for brand suggestions.                                                   |
| `item-photos`    | Private storage bucket, files at `<user id>/<item id>/original.webp` and `thumb.webp`.                                    |

Rules enforced by the database: every row belongs to its owner (RLS), an item's place must belong
to the same owner (composite foreign key), text fields are trimmed and blanks stored as null.

## Database workflow

The hosted project is `ovantbkjltkeoielnaui` (region eu-west-3). After changing the schema:

```sh
npx supabase login        # once
npm run db:link           # once
npm run db:push           # apply new files in supabase/migrations
npm run db:types          # refresh src/lib/supabase/database.types.ts
```

## Next up

- Floating menu button + drop-down pill menu, floating search
- Item detail panel (edit notes, photo, move place, remove with undo)
- Quick-add panel and full "Add a piece" page (brand suggestions, "you already own N similar")
- Photo upload with thumbnails
- Statistics page
- Search: keyword + typo tolerance first, then multilingual semantic search with pgvector
- Colour and type detection from photos
- Deploy (Vercel) and install on the phone as a home-screen app
