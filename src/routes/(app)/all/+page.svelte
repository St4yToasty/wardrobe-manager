<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { plural } from '#lib/wardrobe/format.ts';
	import { tokens } from '#lib/wardrobe/search.ts';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Verdict from '#lib/components/Verdict.svelte';
	import ItemGrid from '#lib/components/ItemGrid.svelte';

	const w = useWardrobe();
	const segs = $derived([
		{ id: 'all', label: 'Both places' },
		...w.places.map((p) => ({ id: p.id, label: p.name }))
	]);
	const basePlace = $derived(
		w.items.filter((it) => w.allPlace === 'all' || it.place_id === w.allPlace)
	);
	const chips = $derived([
		{ slug: 'all', label: 'All', count: basePlace.length },
		...w.types.map((t) => ({
			slug: t.slug,
			label: t.label,
			count: basePlace.filter((it) => it.type === t.slug).length
		}))
	]);
	const visible = $derived(
		basePlace.filter((it) => (w.allType === 'all' || it.type === w.allType) && w.matches(it, w.q))
	);
	const hasQuery = $derived(tokens(w.q).length > 0);
</script>

<svelte:head>
	<title>All clothing · Wardrobe</title>
</svelte:head>

<PageHeader
	title="All clothing"
	subtitle="Total {plural(w.items.length, 'piece')}"
	addLabel="Quick add"
/>
<Verdict />

<div class="filters">
	<div class="seg" role="group" aria-label="Place">
		{#each segs as s (s.id)}
			<button
				type="button"
				class:on={w.allPlace === s.id}
				aria-pressed={w.allPlace === s.id}
				onclick={() => {
					if (w.allPlace !== s.id) {
						w.allPlace = s.id;
						w.anim++;
					}
				}}>{s.label}</button
			>
		{/each}
	</div>
	<div class="chips" role="group" aria-label="Clothing type">
		{#each chips as c (c.slug)}
			<button
				type="button"
				class="fchip"
				class:on={w.allType === c.slug}
				aria-pressed={w.allType === c.slug}
				onclick={() => {
					if (w.allType !== c.slug) {
						w.allType = c.slug;
						w.anim++;
					}
				}}>{c.label} <span class="n">{c.count}</span></button
			>
		{/each}
	</div>
</div>

<ItemGrid items={visible} emptyTitle={hasQuery ? 'Nothing like this here' : 'Nothing here yet'} />

<style>
	.filters {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
</style>
