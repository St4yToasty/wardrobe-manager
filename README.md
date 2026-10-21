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
  env.ts                          declares the PUBLIC_SUPABASE_* variables ($app/env/public)
  hooks.server.ts                 per-request Supabase client, verified session, sign-in guard
  app.css                         design tokens + the shared button/card/panel styles from the canvas
  lib/
    supabase/database.types.ts    generated types (npm run db:types)
    wardrobe/store.svelte.ts      client store: the whole wardrobe + UI state, optimistic writes, photo uploads
    wardrobe/form.svelte.ts       "add a piece" form state: colour from photo, similar pieces, brand suggestions
    wardrobe/search.ts            keyword search with EN/PT synonyms, meaning groups and one-typo tolerance
    wardrobe/stats.ts             numbers behind the Statistics page
    wardrobe/photos.ts            shrink photos (original + thumbnail), read the dominant colour
    wardrobe/icons.ts             line drawings + iconFor(item)
    components/                   Menu, FloatingSearch, PageHeader, Verdict, ItemGrid, PieceFields,
                                  QuickAdd, ItemDetail, Toast, PlaceDrawing
  routes/
    login/  logout/               email + password sign-in, sign-out
    (app)/+layout                 shell: menu, search, quick-add and detail panels, toast
    (app)/                        home: the two places
    (app)/places/[placeId]/       clothing-type squares + Everything (search shows results here)
    (app)/places/[placeId]/[type] pieces of one type (or "all") in a place
    (app)/all                     All clothing, filter by place and type
    (app)/add                     the full "Add a piece" page
    (app)/stats                   Statistics
supabase/
  config.toml
  migrations/                     the schema, applied to the hosted project
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

- Search: multilingual semantic search with pgvector (keyword search is in place)
- Clothing type detection from photos (colour detection is in place)
- Install on the phone as a home-screen app (web app manifest + icon)
