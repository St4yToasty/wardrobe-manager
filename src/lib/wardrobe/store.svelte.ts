/* eslint-disable svelte/prefer-svelte-reactivity -- Dates and Sets here are short-lived locals, not state */
import { getContext, setContext } from 'svelte';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/supabase/database.types.ts';
import type { ClothingType, Colour, Item, NewItem, Place } from './types.ts';
import { PHOTO_BUCKET, photoPath } from './types.ts';
import { iconFor } from './icons.ts';
import { matches, type Searchable } from './search.ts';
import { preparePhoto } from './photos.ts';

export type WardrobeData = {
	userId: string;
	places: Place[];
	types: ClothingType[];
	colours: Colour[];
	items: Item[];
};

export type Toast = { text: string; undo: boolean };

const FALLBACK_HEX = '#A3A19B';
const SIGN_SECONDS = 60 * 60 * 12;

/** UUID v4 that also works on plain-http dev servers, where crypto.randomUUID is missing. */
export function uuid(): string {
	if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
	const b = crypto.getRandomValues(new Uint8Array(16));
	b[6] = (b[6] & 0x0f) | 0x40;
	b[8] = (b[8] & 0x3f) | 0x80;
	const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function today(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2025-03-14" → "Mar 2025" */
export function monthYear(date: string | null | undefined): string {
	if (!date) return '';
	const [y, m, d] = date.split('-').map(Number);
	return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-GB', {
		month: 'short',
		year: 'numeric'
	});
}

/** Everything the screens need: the wardrobe itself, plus the UI state that spans screens. */
export class Wardrobe {
	supabase: SupabaseClient<Database>;
	userId: string;

	places = $state<Place[]>([]);
	types = $state<ClothingType[]>([]);
	colours = $state<Colour[]>([]);
	items = $state<Item[]>([]);
	/** storage path or item id → URL to show (signed URL, or a local preview while uploading) */
	urls = $state<Record<string, string>>({});
	busyPhotos = $state<Record<string, boolean>>({});

	// shared UI state
	q = $state('');
	menuOpen = $state(false);
	panel = $state<null | 'quick' | 'detail'>(null);
	panelOut = $state(false);
	detailId = $state<string | null>(null);
	quickName = $state('');
	toast = $state<Toast | null>(null);
	toastOut = $state(false);
	leaving = $state<string | null>(null);
	fresh = $state<string | null>(null);
	/** bumps to replay entry animations after a filter or data change */
	anim = $state(0);
	allPlace = $state<string>('all');
	allType = $state<string>('all');
	statsPlace = $state<string>('all');
	/** Where the person is, so new pieces default to this place and type. Set by the shell. */
	context = $state<{ placeId?: string; type?: string }>({});
	/** A quick-add form carried over to the full "Add a piece" page. */
	handoff: unknown = null;

	private removed: { item: Item; index: number } | null = null;
	private timers: Record<string, ReturnType<typeof setTimeout>> = {};
	private lastLoad = Date.now();

	constructor(supabase: SupabaseClient<Database>, data: WardrobeData) {
		this.supabase = supabase;
		this.userId = data.userId;
		this.hydrate(data);
	}

	hydrate(data: WardrobeData) {
		this.userId = data.userId;
		this.places = data.places;
		this.types = data.types;
		this.colours = data.colours;
		this.items = data.items;
		this.lastLoad = Date.now();
		void this.signAll();
	}

	// ---------------------------------------------------------------- lookups

	place(id: string | null | undefined): Place | undefined {
		return this.places.find((p) => p.id === id);
	}
	placeName(id: string | null | undefined): string {
		return this.place(id)?.name ?? '';
	}
	/** With two places, "the other one". */
	otherPlace(id: string): Place | undefined {
		return this.places.find((p) => p.id !== id);
	}
	typeLabel(slug: string | null | undefined): string {
		if (slug === 'all') return 'Everything';
		return this.types.find((t) => t.slug === slug)?.label ?? '';
	}
	hex(colour: string | null | undefined): string {
		return this.colours.find((c) => c.name === colour)?.hex ?? FALLBACK_HEX;
	}
	placeIndex(id: string): number {
		return this.places.findIndex((p) => p.id === id);
	}
	icon(item: Pick<Item, 'name' | 'type'>): string {
		return iconFor(item);
	}
	thumbUrl(item: Item): string {
		return (item.thumb_path && this.urls[item.thumb_path]) || this.urls['local:' + item.id] || '';
	}
	photoUrl(item: Item): string {
		return (
			(item.photo_path && this.urls[item.photo_path]) ||
			this.urls['local:' + item.id] ||
			this.thumbUrl(item)
		);
	}
	hasPhoto(item: Item): boolean {
		return !!(item.photo_path || this.urls['local:' + item.id]);
	}
	searchable(it: Item): Searchable {
		return {
			name: it.name,
			typeLabel: this.typeLabel(it.type),
			colour: it.colour,
			brand: it.brand,
			placeName: this.placeName(it.place_id),
			notes: it.notes
		};
	}
	matches(it: Item, q: string): boolean {
		return matches(this.searchable(it), q);
	}
	inPlace(placeId: string): Item[] {
		return this.items.filter((it) => it.place_id === placeId);
	}
	/** Brands used so far, most used first. */
	brandStats(): string[] {
		const m: Record<string, number> = {};
		for (const it of this.items) if (it.brand) m[it.brand] = (m[it.brand] ?? 0) + 1;
		return Object.keys(m).sort((a, b) => m[b] - m[a] || a.localeCompare(b));
	}
	get detail(): Item | undefined {
		return this.items.find((x) => x.id === this.detailId);
	}

	// ---------------------------------------------------------------- data

	async refresh() {
		const { data, error } = await this.supabase
			.from('items')
			.select('*')
			.is('deleted_at', null)
			.order('added_on', { ascending: false })
			.order('created_at', { ascending: false });
		if (error || !data) return;
		// keep optimistic rows that the server doesn't know about yet
		const ids = new Set(data.map((d) => d.id));
		const pending = this.items.filter((it) => !ids.has(it.id) && this.busyPhotos[it.id]);
		this.items = [...pending, ...data];
		this.lastLoad = Date.now();
		await this.signAll();
	}

	/** Pull fresh data when coming back to the app, so phone and computer stay in step. */
	refreshIfStale(ms = 30_000) {
		if (Date.now() - this.lastLoad > ms) void this.refresh();
	}

	private async signAll() {
		const paths = this.items
			.flatMap((it) => [it.thumb_path, it.photo_path])
			.filter(Boolean) as string[];
		if (!paths.length) return;
		const { data } = await this.supabase.storage
			.from(PHOTO_BUCKET)
			.createSignedUrls(paths, SIGN_SECONDS);
		if (!data) return;
		const next = { ...this.urls };
		for (const r of data) if (r.path && r.signedUrl) next[r.path] = r.signedUrl;
		this.urls = next;
	}

	private patchLocal(id: string, patch: Partial<Item>) {
		this.items = this.items.map((x) => (x.id === id ? { ...x, ...patch } : x));
	}

	async update(id: string, patch: Partial<Item>) {
		this.patchLocal(id, patch);
		const { error } = await this.supabase.from('items').update(patch).eq('id', id);
		if (error) this.showToast('Could not save that change. Check your connection.');
	}

	async move(item: Item) {
		const other = this.otherPlace(item.place_id);
		if (!other) return;
		this.anim++;
		this.showToast('Moved to ' + other.name);
		await this.update(item.id, { place_id: other.id });
	}

	async add(input: {
		name: string;
		type: string;
		colour: string;
		brand: string;
		size: string;
		price: string;
		notes: string;
		placeId: string;
		file: File | null;
		preview: string;
	}): Promise<Item | null> {
		const nm = input.name.trim();
		const price = parseFloat(input.price.replace(',', '.'));
		const id = uuid();
		const now = new Date().toISOString();
		const row: NewItem = {
			id,
			owner_id: this.userId,
			place_id: input.placeId,
			type: input.type,
			name: nm.charAt(0).toUpperCase() + nm.slice(1),
			colour: input.colour || null,
			brand: input.brand.trim() || null,
			size: input.size.trim() || null,
			price: Number.isNaN(price) ? null : Math.round(price * 100) / 100,
			notes: input.notes.trim() || null,
			added_on: today()
		};
		const optimistic: Item = {
			...(row as Item),
			photo_path: null,
			thumb_path: null,
			created_at: now,
			updated_at: now,
			deleted_at: null
		};
		this.items = [optimistic, ...this.items];
		if (input.file && input.preview) {
			this.urls = { ...this.urls, ['local:' + id]: input.preview };
			this.busyPhotos = { ...this.busyPhotos, [id]: true };
		}
		this.anim++;
		this.flash(id);
		this.showToast(`Added to ${this.placeName(row.place_id)} · ${this.typeLabel(row.type)}`);

		const { error } = await this.supabase.from('items').insert(row);
		if (error) {
			this.items = this.items.filter((x) => x.id !== id);
			this.showToast('Could not add it. Check your connection and try again.');
			return null;
		}
		if (input.file) void this.uploadPhoto(optimistic, input.file);
		return optimistic;
	}

	/** Shrink, upload original + thumbnail, then point the item at them. */
	async uploadPhoto(item: Item, file: File) {
		this.busyPhotos = { ...this.busyPhotos, [item.id]: true };
		try {
			const p = await preparePhoto(file);
			const original = photoPath(this.userId, item.id, 'original', p.ext);
			const thumb = photoPath(this.userId, item.id, 'thumb', p.ext);
			const bucket = this.supabase.storage.from(PHOTO_BUCKET);
			const opts = { contentType: p.contentType, upsert: true, cacheControl: '31536000' };
			const [a, b] = await Promise.all([
				bucket.upload(original, p.original, opts),
				bucket.upload(thumb, p.thumb, opts)
			]);
			if (a.error || b.error) throw a.error ?? b.error;
			// remove an old photo saved under a different extension
			const stale = [item.photo_path, item.thumb_path].filter(
				(x) => x && x !== original && x !== thumb
			) as string[];
			if (stale.length) await bucket.remove(stale);
			await this.update(item.id, { photo_path: original, thumb_path: thumb });
			const { data } = await bucket.createSignedUrls([original, thumb], SIGN_SECONDS);
			const next = { ...this.urls };
			for (const r of data ?? []) if (r.path && r.signedUrl) next[r.path] = r.signedUrl;
			this.urls = next;
		} catch {
			this.showToast('The photo could not be uploaded. Try again.');
		} finally {
			const rest = { ...this.busyPhotos };
			delete rest[item.id];
			this.busyPhotos = rest;
		}
	}

	async replacePhoto(item: Item, file: File) {
		const preview = URL.createObjectURL(file);
		const next = { ...this.urls, ['local:' + item.id]: preview };
		// show the new picture straight away instead of the old signed one
		if (item.photo_path) delete next[item.photo_path];
		if (item.thumb_path) delete next[item.thumb_path];
		this.urls = next;
		await this.uploadPhoto(item, file);
	}

	async removePhoto(item: Item) {
		const paths = [item.photo_path, item.thumb_path].filter(Boolean) as string[];
		const next = { ...this.urls };
		delete next['local:' + item.id];
		this.urls = next;
		this.showToast('Photo removed, showing the drawing');
		await this.update(item.id, { photo_path: null, thumb_path: null });
		if (paths.length) await this.supabase.storage.from(PHOTO_BUCKET).remove(paths);
	}

	/** Card shrinks away, then the piece is hidden (soft delete) with an Undo in the toast. */
	remove(item: Item) {
		if (this.leaving) return;
		this.leaving = item.id;
		this.later('leave', 280, async () => {
			const index = this.items.findIndex((x) => x.id === item.id);
			this.items = this.items.filter((x) => x.id !== item.id);
			this.leaving = null;
			this.removed = { item, index };
			this.showToast('Removed ' + item.name.toLowerCase(), true);
			const { error } = await this.supabase
				.from('items')
				.update({ deleted_at: new Date().toISOString() })
				.eq('id', item.id);
			if (error) {
				this.restore();
				this.showToast('Could not remove it. Check your connection.');
			}
		});
	}

	private restore() {
		const r = this.removed;
		if (!r) return null;
		const items = this.items.slice();
		items.splice(Math.max(0, r.index), 0, r.item);
		this.items = items;
		this.removed = null;
		this.anim++;
		this.flash(r.item.id);
		return r.item;
	}

	async undo() {
		const item = this.restore();
		this.hideToast();
		if (item) await this.supabase.from('items').update({ deleted_at: null }).eq('id', item.id);
	}

	// ---------------------------------------------------------------- UI helpers

	later(key: string, ms: number, fn: () => void) {
		clearTimeout(this.timers[key]);
		this.timers[key] = setTimeout(fn, ms);
	}

	showToast(text: string, undo = false) {
		this.toast = { text, undo };
		this.toastOut = false;
		this.later('toast', 4200, () => this.hideToast());
	}

	hideToast() {
		if (!this.toast) return;
		this.toastOut = true;
		this.later('toastGone', 240, () => {
			this.toast = null;
			this.toastOut = false;
		});
	}

	flash(id: string) {
		this.fresh = id;
		this.later('fresh', 1700, () => (this.fresh = null));
	}

	openQuick(name = '') {
		clearTimeout(this.timers.panel);
		this.quickName = name;
		this.menuOpen = false;
		this.panel = 'quick';
		this.panelOut = false;
	}

	openDetail(id: string) {
		clearTimeout(this.timers.panel);
		this.detailId = id;
		this.menuOpen = false;
		this.panel = 'detail';
		this.panelOut = false;
	}

	closePanel(after?: () => void) {
		if (!this.panel || this.panelOut) return;
		this.panelOut = true;
		this.later('panel', 260, () => {
			this.panel = null;
			this.panelOut = false;
			after?.();
		});
	}
}

const KEY = Symbol('wardrobe');

export function setWardrobe(w: Wardrobe) {
	return setContext(KEY, w);
}

export function useWardrobe(): Wardrobe {
	return getContext<Wardrobe>(KEY);
}
