import type { Wardrobe } from './store.svelte.ts';
import { euro, plural } from './format.ts';

export type Row = { label: string; n: number; w: number; value: string; tip: string; hex?: string };
export type SplitRow = {
	label: string;
	aw: number;
	bw: number;
	value: string;
	tip: string;
	aOnly: boolean;
};
export type YearCol = { label: string; value: number; h: number; tip: string };
export type Kpi = { label: string; value: string; note: string };

const money = (n: number) => euro(Math.round(n)) || '€0';
const count = (n: number) => String(n);

function rows(
	pairs: { label: string; n: number; hex?: string }[],
	fmt: (n: number) => string,
	unit: string
): Row[] {
	const max = pairs.reduce((m, p) => Math.max(m, p.n), 0) || 1;
	return pairs.map((p) => ({
		...p,
		w: Math.max(p.n ? 2 : 0, (p.n / max) * 100),
		value: fmt(p.n),
		tip: `${p.label}: ${fmt(p.n)}${unit ? ' ' + unit : ''}`
	}));
}

/** Everything the Statistics page shows, for one place or both ('all'). */
export function statistics(w: Wardrobe, placeId: string) {
	const list = w.items.filter((it) => placeId === 'all' || it.place_id === placeId);
	const price = (n: number | null) => (typeof n === 'number' ? n : 0);
	const total = list.reduce((a, it) => a + price(it.price), 0);
	const priced = list.filter((it) => typeof it.price === 'number');
	const top = priced.slice().sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0];
	const photos = list.filter((it) => w.hasPhoto(it)).length;
	const types = w.types;

	const byType = rows(
		types.map((t) => ({ label: t.label, n: list.filter((it) => it.type === t.slug).length })),
		count,
		'pieces'
	);
	const valueByType = rows(
		types.map((t) => ({
			label: t.label,
			n: list.filter((it) => it.type === t.slug).reduce((a, it) => a + price(it.price), 0)
		})),
		money,
		''
	);

	const bm: Record<string, number> = {};
	for (const it of list) {
		const b = it.brand || 'No brand';
		bm[b] = (bm[b] ?? 0) + 1;
	}
	let brands = Object.keys(bm)
		.sort((a, b) => bm[b] - bm[a] || a.localeCompare(b))
		.map((b) => ({ label: b, n: bm[b] }));
	if (brands.length > 7) {
		const rest = brands.slice(6).reduce((a, b) => a + b.n, 0);
		brands = [...brands.slice(0, 6), { label: 'Other', n: rest }];
	}
	const byBrand = rows(brands, count, 'pieces');

	const cm: Record<string, number> = {};
	for (const it of list) {
		const c = it.colour || 'No colour';
		cm[c] = (cm[c] ?? 0) + 1;
	}
	const byColour = rows(
		Object.keys(cm)
			.sort((a, b) => cm[b] - cm[a] || a.localeCompare(b))
			.map((c) => ({ label: c, n: cm[c], hex: w.hex(c) })),
		count,
		'pieces'
	);

	// where each type is kept: always across the whole wardrobe, first two places
	const [pa, pb] = w.places;
	const all = w.items;
	const maxT =
		types.reduce((m, t) => Math.max(m, all.filter((it) => it.type === t.slug).length), 0) || 1;
	const split: SplitRow[] = types.map((t) => {
		const a = all.filter((it) => it.type === t.slug && it.place_id === pa?.id).length;
		const b = all.filter((it) => it.type === t.slug && it.place_id === pb?.id).length;
		return {
			label: t.label,
			aw: (a / maxT) * 100,
			bw: (b / maxT) * 100,
			aOnly: !b,
			value: `${a} · ${b}`,
			tip: `${t.label}: ${a} in ${pa?.name ?? ''}, ${b} in ${pb?.name ?? ''}`
		};
	});

	const ym: Record<string, number> = {};
	for (const it of list) {
		const y = (it.added_on || '').slice(0, 4);
		if (/^\d{4}$/.test(y)) ym[y] = (ym[y] ?? 0) + 1;
	}
	const years = Object.keys(ym).sort();
	const maxY = years.reduce((m, y) => Math.max(m, ym[y]), 0) || 1;
	const byYear: YearCol[] = years.map((y) => ({
		label: y,
		value: ym[y],
		h: (ym[y] / maxY) * 82,
		tip: `${y}: ${plural(ym[y], 'piece')} added`
	}));

	const topBrand = brands.filter((b) => b.label !== 'Other' && b.label !== 'No brand')[0];
	const typesUsed = types.filter((t) => list.some((it) => it.type === t.slug)).length;
	const kpis: Kpi[] = [
		{ label: 'Pieces', value: String(list.length), note: plural(typesUsed, 'type') },
		{
			label: 'Total value',
			value: money(total),
			note: `${priced.length} of ${list.length} priced`
		},
		{
			label: 'Average price',
			value: priced.length ? money(total / priced.length) : 'n/a',
			note: 'per priced piece'
		},
		{
			label: 'Most expensive',
			value: top ? money(top.price ?? 0) : 'n/a',
			note: top ? `${top.colour ?? ''} ${top.name.toLowerCase()}`.trim() : ''
		},
		{
			label: 'Top brand',
			value: topBrand ? topBrand.label : 'n/a',
			note: topBrand ? plural(topBrand.n, 'piece') : ''
		},
		{
			label: 'With a photo',
			value: list.length ? Math.round((photos / list.length) * 100) + '%' : 'n/a',
			note: `${photos} of ${list.length}`
		}
	];

	return { kpis, byType, valueByType, byBrand, byColour, split, byYear, placeA: pa, placeB: pb };
}
