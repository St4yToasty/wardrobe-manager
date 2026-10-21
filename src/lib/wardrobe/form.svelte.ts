import type { Wardrobe } from './store.svelte.ts';
import type { Item } from './types.ts';
import { tokens } from './search.ts';
import { dominantRgb, nearestColour } from './photos.ts';

type Detect = { status: 'idle' | 'busy' | 'done' | 'fail'; colour: string };

/** State of the "add a piece" form, shared by the quick-add panel and the full page. */
export class PieceForm {
	w: Wardrobe;
	name = $state('');
	type = $state('tops');
	colour = $state('');
	colourAuto = $state(false);
	brand = $state('');
	size = $state('');
	price = $state('');
	notes = $state('');
	placeId = $state('');
	file = $state<File | null>(null);
	preview = $state('');
	detect = $state<Detect>({ status: 'idle', colour: '' });
	saving = $state(false);
	private run = 0;

	constructor(w: Wardrobe, defaults: { placeId?: string; type?: string; name?: string }) {
		this.w = w;
		this.placeId = defaults.placeId || w.places[0]?.id || '';
		this.type = defaults.type && defaults.type !== 'all' ? defaults.type : 'tops';
		this.name = defaults.name ?? '';
	}

	get canSave() {
		return !!(this.name.trim() && this.colour && this.placeId) && !this.saving;
	}

	get colourLabel() {
		return this.colour ? '· ' + this.colour + (this.colourAuto ? ' (from photo)' : '') : '';
	}

	setPrice(v: string) {
		this.price = v.replace(/[^0-9.,]/g, '');
	}

	pickColour(name: string) {
		this.colour = name;
		this.colourAuto = false;
	}

	/** Keep the photo, and read its colour (the scan runs for at least ~1 s so it reads as a step). */
	setPhoto(file: File | null | undefined) {
		if (!file) return;
		if (this.preview) URL.revokeObjectURL(this.preview);
		this.file = file;
		this.preview = URL.createObjectURL(file);
		const run = ++this.run;
		const started = Date.now();
		this.detect = { status: 'busy', colour: '' };
		void dominantRgb(file).then((rgb) => {
			const c = rgb ? nearestColour(rgb, this.w.colours) : null;
			const wait = Math.max(0, 1100 - (Date.now() - started));
			setTimeout(() => {
				if (run !== this.run) return;
				if (!c) {
					this.detect = { status: 'fail', colour: '' };
					return;
				}
				if (!this.colour || this.colourAuto) {
					this.colour = c.name;
					this.colourAuto = true;
				}
				this.detect = { status: 'done', colour: c.name };
			}, wait);
		});
	}

	removePhoto() {
		this.run++;
		if (this.preview) URL.revokeObjectURL(this.preview);
		this.file = null;
		this.preview = '';
		if (this.colourAuto) this.colour = '';
		this.colourAuto = false;
		this.detect = { status: 'idle', colour: '' };
	}

	get detectStatus() {
		const s = this.detect.status;
		return s === 'busy'
			? 'Reading photo…'
			: s === 'done'
				? 'Done'
				: s === 'fail'
					? 'Couldn’t read photo'
					: '';
	}

	get detectStatusLong() {
		const s = this.detect.status;
		if (s === 'busy') return 'Reading the colour…';
		if (s === 'done') return 'Colour detected: ' + this.detect.colour;
		return this.file ? 'Photo added' : 'Optional. Tap to add and we’ll read the colour.';
	}

	/** Same type and (same colour, or a shared word in the name). */
	get similar(): Item[] {
		if (!this.name.trim() && !this.colour) return [];
		const words = tokens(this.name)
			.filter((w) => w.length > 2)
			.map((w) => w.replace(/s$/, ''));
		const colour = this.colour;
		return this.w.items.filter((it) => {
			if (it.type !== this.type) return false;
			const n = it.name.toLowerCase();
			const wordHit = words.some((w) => n.includes(w));
			if (colour && it.colour === colour) return words.length ? wordHit : true;
			return wordHit && !colour;
		});
	}

	get brandHint() {
		return this.brand.trim() ? 'Suggestions' : 'Your usual brands';
	}

	get brandSuggestions(): string[] {
		const typed = this.brand.trim().toLowerCase();
		return this.w
			.brandStats()
			.filter((b) => {
				const l = b.toLowerCase();
				return typed ? l.startsWith(typed) && l !== typed : true;
			})
			.slice(0, 6);
	}

	async save(): Promise<Item | null> {
		if (!this.canSave) return null;
		this.saving = true;
		const item = await this.w.add({
			name: this.name,
			type: this.type,
			colour: this.colour,
			brand: this.brand,
			size: this.size,
			price: this.price,
			notes: this.notes,
			placeId: this.placeId,
			file: this.file,
			preview: this.preview
		});
		this.saving = false;
		// the preview URL now belongs to the store until the upload finishes
		if (item) this.preview = '';
		return item;
	}
}
