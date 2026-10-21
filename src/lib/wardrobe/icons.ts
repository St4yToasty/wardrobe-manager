// Line drawings from the Wardrobe design canvas. One outline path each, viewBox 0 0 120 120.
// Cards fill the path with the item's colour; category squares draw it as an outline.

export const ICONS = {
	tee: 'M43 22L30 28L14 45L26 58L34 52V100H86V52L94 58L106 45L90 28L77 22C71 30 49 30 43 22Z',
	bottoms: 'M36 14H84L91 106H68L60 46L52 106H29Z M36 24H84',
	coat: 'M45 14L29 22L17 50L22 92H33L35 58V108H85V58L87 92H98L103 50L91 22L75 14L60 40Z M60 40V108',
	sneaker:
		'M18 84V60C18 56 21 54 25 54H33C37 54 40 58 44 60C48 62 52 58 55 50L61 48C68 58 78 67 93 71C105 74 111 78 112 84Z M14 84H112V89C112 92 110 94 107 94H19C16 94 14 92 14 89Z M61 60L68 55 M68 66L75 61 M76 71L82 66',
	boot: 'M38 18H66V66C66 70 69 72 73 73L96 78C102 79 106 84 106 90V96H32V24C32 21 35 18 38 18Z M30 96H108V103H30Z M38 30H66',
	boxer: 'M26 30H94V42H26Z M26 42L22 88H52L60 66L68 88H98L94 42Z',
	sock: 'M46 14H74V62L92 80C99 87 98 99 90 104C84 108 76 106 71 101L50 80C47 77 46 74 46 70Z M46 28H74',
	pyjama:
		'M42 18L30 24L14 68L28 74L36 52V106H84V52L92 74L106 68L90 24L78 18L60 34Z M60 34V106 M42 18L50 38L60 34 M78 18L70 38L60 34 M66 54A2 2 0 1 0 66.1 54Z M66 72A2 2 0 1 0 66.1 72Z M66 90A2 2 0 1 0 66.1 90Z',
	tank: 'M44 14V24C44 38 51 46 60 46C69 46 76 38 76 24V14H86V30C86 38 91 44 96 50V106H24V50C29 44 34 38 34 30V14Z',
	swim: 'M24 28H96L101 90H67L60 66L53 90H19Z M24 40H96 M56 40L53 54 M64 40L67 54',
	hoodie:
		'M30 34L44 26C48 34 72 34 76 26L90 34L106 74L92 80L86 62V106H34V62L28 80L14 74Z M44 26C44 15 52 9 60 9C68 9 76 15 76 26C70 33 50 33 44 26Z M51 24C53 17 67 17 69 24 M55 32V44 M65 32V44 M44 80H76L80 98H40Z',
	joggers:
		'M36 14H84L89 94H68L60 44L52 94H31Z M36 24H84 M31 94L32 106H52L52 94 M68 94L68 106H88L89 94 M60 24V34',
	shorts: 'M28 30H92L98 84H66L60 62L54 84H22Z M28 40H92',
	beanie:
		'M53 30A7 7 0 1 0 67 30A7 7 0 1 0 53 30Z M30 78C30 50 42 37 60 37C78 37 90 50 90 78Z M30 76H90A4 4 0 0 1 94 80V88A4 4 0 0 1 90 92H30A4 4 0 0 1 26 88V80A4 4 0 0 1 30 76Z',
	belt: 'M10 52H34 M10 68H34 M58 52H110V68H58 M34 44H58V76H34Z M41 51H51V69H41Z M46 60H72 M86 60A2.5 2.5 0 1 0 91 60A2.5 2.5 0 1 0 86 60Z M98 60A2.5 2.5 0 1 0 103 60A2.5 2.5 0 1 0 98 60Z',
	all: 'M22 22H54V54H22Z M66 22H98V54H66Z M22 66H54V98H22Z M66 66H98V98H66Z'
} as const;

export type IconKey = keyof typeof ICONS;

/** Fallback drawing per clothing type slug (matches clothing_types.icon in the database). */
export const TYPE_ICON: Record<string, IconKey> = {
	tops: 'tee',
	bottoms: 'bottoms',
	outerwear: 'coat',
	shoes: 'sneaker',
	underwear: 'boxer',
	sleepwear: 'pyjama',
	sportswear: 'tank',
	swimwear: 'swim',
	house: 'hoodie',
	accessories: 'beanie'
};

// Name patterns (EN + PT) that pick a more specific drawing than the type's default.
const NAME_RULES: [RegExp, IconKey][] = [
	[/belt|cinto/, 'belt'],
	[/sock|meia/, 'sock'],
	[/boot|bota/, 'boot'],
	[/sneaker|trainer|running shoe|sapatilha/, 'sneaker'],
	[/beanie|hat|cap|gorro/, 'beanie'],
	[/swim|bikini|calções de banho/, 'swim'],
	[/short|calções|bermuda/, 'shorts'],
	[/sweatpant|jogger|track ?pant|legging|fato de treino/, 'joggers'],
	[/jean|chino|trouser|pant|calças/, 'bottoms'],
	[/hoodie|sweatshirt|moletom|camisola com capuz/, 'hoodie'],
	[/tank|vest|singlet|top de alças/, 'tank'],
	[/boxer|brief|cueca/, 'boxer'],
	[/coat|jacket|parka|casaco/, 'coat'],
	[/shirt|tee|polo|sweater|jumper|t-shirt|camisa|camisola/, 'tee']
];

/** The drawing for an item: a specific shape from its name when one fits, else its type's. */
export function iconFor(item: { name?: string | null; type: string }): string {
	const name = (item.name ?? '').toLowerCase();
	for (const [re, key] of NAME_RULES) if (re.test(name)) return ICONS[key];
	return ICONS[TYPE_ICON[item.type] ?? 'tee'];
}
