/** €39.90 → "€39.90", €25 → "€25", empty → "". */
export function euro(n: number | null | undefined): string {
	if (n === null || n === undefined || Number.isNaN(n)) return '';
	return '€' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
}

/** "3 pieces", "1 piece". */
export function plural(n: number, word: string): string {
	return `${n} ${word}${n === 1 ? '' : 's'}`;
}
