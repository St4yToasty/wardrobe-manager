<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { plural } from '#lib/wardrobe/format.ts';
	import { tokens } from '#lib/wardrobe/search.ts';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Verdict from '#lib/components/Verdict.svelte';
	import ItemGrid from '#lib/components/ItemGrid.svelte';

	const w = useWardrobe();
	const placeId = $derived(page.params.placeId!);
	const type = $derived(page.params.type!);
	const place = $derived(w.place(placeId));
	const scoped = $derived(w.inPlace(placeId).filter((it) => type === 'all' || it.type === type));
	const visible = $derived(scoped.filter((it) => w.matches(it, w.q)));
	const hasQuery = $derived(tokens(w.q).length > 0);
</script>

<svelte:head>
	<title>{w.typeLabel(type)} in {place?.name} · Wardrobe</title>
</svelte:head>

{#if place}
	<PageHeader
		crumb={{ label: place.name, href: resolve('/(app)/places/[placeId]', { placeId }) }}
		title={w.typeLabel(type)}
		subtitle="Total {plural(scoped.length, 'piece')}"
		addLabel="Add to {place.name}"
	/>
	<Verdict />
	<ItemGrid items={visible} emptyTitle={hasQuery ? 'Nothing like this here' : 'Nothing here yet'} />
{/if}
