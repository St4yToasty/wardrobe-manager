// Wardrobe search, ported from the design prototype: keywords, EN/PT synonyms, meaning
// groups (blue → navy/indigo, warm → wool/coat...), one-typo tolerance, notes included.
// To be replaced by semantic search (embeddings) later; the interface stays the same.

const STOP = ['do', 'i', 'own', 'already', 'a', 'an', 'the', 'any', 'my', 'have', 'of', 'in'];

// Small synonym map (EN + PT).
const SYN: Record<string, string[]> = {
	jeans: ['denim', 'jean'],
	denim: ['jeans'],
	pants: ['trousers', 'chinos', 'jeans'],
	trousers: ['pants', 'chinos'],
	sneakers: ['trainers', 'sneaker'],
	trainers: ['sneakers'],
	tee: ['t-shirt', 'tshirt'],
	't-shirt': ['tee'],
	tshirt: ['tee'],
	sweater: ['jumper', 'knit', 'pullover', 'merino'],
	jumper: ['sweater', 'knit'],
	hoodie: ['sweater'],
	jacket: ['coat', 'parka'],
	coat: ['jacket', 'parka'],
	hat: ['beanie', 'cap'],
	beanie: ['hat'],
	boots: ['boot'],
	calças: ['trousers', 'jeans', 'chinos'],
	calcas: ['trousers', 'jeans', 'chinos'],
	camisola: ['sweater', 'tee'],
	camisa: ['shirt'],
	casaco: ['jacket', 'coat'],
	sapatilhas: ['sneakers', 'shoes'],
	botas: ['boots'],
	cinto: ['belt'],
	gorro: ['beanie'],
	preto: ['black'],
	preta: ['black'],
	branco: ['white'],
	branca: ['white'],
	cinzento: ['grey'],
	azul: ['blue', 'navy', 'indigo'],
	castanho: ['brown'],
	gray: ['grey'],
	'dark blue': ['navy']
};

// Meaning groups: a word in the search also finds related colours, types and styles.
const SEM: Record<string, string[]> = {
	blue: ['blue', 'navy', 'indigo', 'denim', 'jeans'],
	navy: ['navy', 'blue'],
	indigo: ['indigo', 'blue', 'denim'],
	black: ['black', 'charcoal'],
	dark: ['black', 'charcoal', 'navy', 'indigo', 'brown', 'olive'],
	grey: ['grey', 'charcoal'],
	charcoal: ['charcoal', 'grey', 'black'],
	light: ['white', 'beige', 'grey'],
	white: ['white', 'beige'],
	beige: ['beige', 'white', 'brown'],
	cream: ['beige', 'white'],
	tan: ['beige', 'brown'],
	brown: ['brown', 'beige'],
	green: ['green', 'olive'],
	olive: ['olive', 'green'],
	khaki: ['olive', 'beige'],
	red: ['red'],
	burgundy: ['red'],
	neutral: ['white', 'black', 'grey', 'charcoal', 'beige'],
	earth: ['brown', 'beige', 'olive'],
	top: ['tops', 'shirt', 'tee', 'polo', 'sweater'],
	shirt: ['shirt', 'oxford', 'flannel', 'polo'],
	tshirt: ['tee'],
	bottom: ['bottoms', 'jeans', 'chinos', 'trousers'],
	pants: ['bottoms', 'trousers', 'chinos', 'jeans'],
	shorts: ['shorts'],
	shoe: ['shoes', 'sneakers', 'boots'],
	footwear: ['shoes', 'sneakers', 'boots'],
	sneaker: ['sneakers', 'running'],
	trainer: ['sneakers', 'running'],
	jacket: ['jacket', 'coat', 'outerwear'],
	coat: ['coat', 'jacket', 'outerwear'],
	outerwear: ['outerwear', 'jacket', 'coat'],
	warm: ['sweater', 'merino', 'wool', 'coat', 'flannel', 'beanie', 'boots'],
	winter: ['coat', 'wool', 'merino', 'beanie', 'boots', 'flannel'],
	summer: ['tee', 'polo', 'chinos', 'sneakers', 'oxford'],
	rain: ['rain'],
	sport: ['running'],
	gym: ['running', 'tee'],
	formal: ['tailored', 'oxford', 'wool', 'belt', 'boots'],
	smart: ['tailored', 'oxford', 'chinos', 'polo', 'coat'],
	casual: ['tee', 'jeans', 'sneakers', 'chinos', 'flannel', 'beanie'],
	accessory: ['accessories', 'belt', 'beanie'],
	pyjamas: ['pyjamas', 'sleepwear'],
	pajamas: ['pyjamas', 'sleepwear'],
	pijama: ['pyjamas', 'sleepwear'],
	sleep: ['sleepwear', 'pyjamas'],
	sports: ['sportswear', 'running'],
	sportswear: ['sportswear', 'running'],
	swim: ['swimwear', 'swim'],
	swimsuit: ['swimwear', 'swim'],
	fato: ['swimwear', 'suit'],
	house: ['house', 'sweatpants', 'hoodie'],
	home: ['house', 'sweatpants'],
	lounge: ['house', 'sweatpants', 'pyjamas'],
	comfy: ['house', 'sweatpants', 'hoodie', 'pyjamas'],
	underwear: ['underwear', 'boxer', 'briefs', 'socks'],
	boxers: ['boxer', 'underwear'],
	briefs: ['briefs', 'boxer', 'underwear'],
	sock: ['socks'],
	cuecas: ['boxer', 'briefs', 'underwear'],
	meias: ['socks'],
	hat: ['beanie'],
	knit: ['sweater', 'merino', 'beanie', 'ribbed']
};

/** True when a and b (5+ letters) differ by one insertion, deletion or substitution. */
function near(a: string, b: string): boolean {
	if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
	let i = 0,
		j = 0,
		edits = 0;
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			i++;
			j++;
			continue;
		}
		if (++edits > 1) return false;
		if (a.length > b.length) i++;
		else if (b.length > a.length) j++;
		else {
			i++;
			j++;
		}
	}
	return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Search words, without filler words like "do I own a". */
export function tokens(q: string): string[] {
	return q
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length > 1 && !STOP.includes(t));
}

export type Searchable = {
	name: string;
	typeLabel: string;
	colour: string | null;
	brand: string | null;
	placeName: string;
	notes: string | null;
};

/** Every search word must hit the item (directly, through a synonym/meaning, or within one typo). */
export function matches(it: Searchable, q: string): boolean {
	const toks = tokens(q);
	if (!toks.length) return true;
	const hay = [it.name, it.typeLabel, it.colour, it.brand, it.placeName, it.notes]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
	const words = hay.split(/[^a-zà-ÿ'-]+/);
	return toks.every((t) => {
		const single = t.replace(/s$/, '');
		let opts = [
			t,
			single,
			...(SYN[t] ?? []),
			...(SYN[single] ?? []),
			...(SEM[t] ?? []),
			...(SEM[single] ?? [])
		];
		for (const s of SYN[t] ?? SYN[single] ?? []) opts = opts.concat(SEM[s] ?? []);
		if (opts.some((o) => o && words.some((w) => w === o || w.startsWith(o)))) return true;
		return words.some((w) => near(w, t) || near(w, single));
	});
}
