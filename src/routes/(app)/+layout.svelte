<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Wardrobe, setWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import Menu from '#lib/components/Menu.svelte';
	import FloatingSearch from '#lib/components/FloatingSearch.svelte';
	import QuickAdd from '#lib/components/QuickAdd.svelte';
	import ItemDetail from '#lib/components/ItemDetail.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// svelte-ignore state_referenced_locally
	const w = setWardrobe(new Wardrobe(data.supabase, data.wardrobe));
	let first = true;
	$effect(() => {
		const next = data.wardrobe;
		if (first) {
			first = false;
			return;
		}
		w.hydrate(next);
	});

	const VIEWS: Record<string, string> = {
		'/(app)': 'home',
		'/(app)/places/[placeId]': 'place',
		'/(app)/places/[placeId]/[type]': 'items',
		'/(app)/all': 'all',
		'/(app)/add': 'add',
		'/(app)/stats': 'stats'
	};
	const view = $derived(VIEWS[page.route.id ?? ''] ?? 'home');
	const placeId = $derived(page.params.placeId);
	const type = $derived(page.params.type);
	const place = $derived(w.place(placeId));

	// New pieces default to where you are.
	$effect(() => {
		const p =
			view === 'place' || view === 'items'
				? placeId
				: view === 'all' && w.allPlace !== 'all'
					? w.allPlace
					: undefined;
		const t =
			view === 'items' && type !== 'all'
				? type
				: view === 'all' && w.allType !== 'all'
					? w.allType
					: undefined;
		w.context = { placeId: p, type: t };
	});

	const showSearch = $derived(view === 'place' || view === 'items' || view === 'all');
	const placeholder = $derived(
		view === 'items'
			? `Search ${type === 'all' ? 'everything' : w.typeLabel(type).toLowerCase()} in ${place?.name ?? ''}…`
			: view === 'place'
				? `Search ${place?.name ?? ''}… or check if you own it`
				: 'Do I already own… try “black jeans” or “sapatilhas brancas”'
	);

	// Every screen change starts clean: no search, menu closed, entry animations replay.
	afterNavigate(({ type: navType }) => {
		if (navType === 'enter') return;
		w.q = '';
		w.menuOpen = false;
		w.anim++;
	});

	onMount(() => {
		const onVisible = () => document.visibilityState === 'visible' && w.refreshIfStale();
		document.addEventListener('visibilitychange', onVisible);
		window.addEventListener('focus', onVisible);
		return () => {
			document.removeEventListener('visibilitychange', onVisible);
			window.removeEventListener('focus', onVisible);
		};
	});
</script>

<div class="app">
	<Menu {view} {placeId} />
	{#if showSearch}
		<FloatingSearch {placeholder} />
	{/if}

	<main class="wrap" class:tight={view === 'home' || (view === 'place' && !w.q.trim())}>
		{#key page.url.pathname}
			<div class="view">
				{@render children()}
			</div>
		{/key}
	</main>

	{#if w.panel === 'quick'}
		<QuickAdd />
	{:else if w.panel === 'detail' && w.detail}
		{#key w.detailId}
			<ItemDetail item={w.detail} />
		{/key}
	{/if}

	<Toast />
</div>

<style>
	.app {
		min-height: 100vh;
		background: var(--ground);
		color: var(--ink);
	}
</style>
