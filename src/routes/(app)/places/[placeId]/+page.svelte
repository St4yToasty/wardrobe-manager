<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { ICONS, TYPE_ICON } from '#lib/wardrobe/icons.ts';
	import { plural } from '#lib/wardrobe/format.ts';
	import { tokens } from '#lib/wardrobe/search.ts';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Verdict from '#lib/components/Verdict.svelte';
	import ItemGrid from '#lib/components/ItemGrid.svelte';

	const w = useWardrobe();
	const placeId = $derived(page.params.placeId!);
	const place = $derived(w.place(placeId));
	const hasQuery = $derived(tokens(w.q).length > 0);
	const here = $derived(w.inPlace(placeId));
	const visible = $derived(here.filter((it) => w.matches(it, w.q)));

	const tiles = $derived([
		...w.types.map((t) => ({
			href: resolve('/(app)/places/[placeId]/[type]', { placeId, type: t.slug }),
			label: t.label,
			icon: ICONS[TYPE_ICON[t.slug] ?? 'tee']
		})),
		{
			href: resolve('/(app)/places/[placeId]/[type]', { placeId, type: 'all' }),
			label: 'Everything',
			icon: ICONS.all
		}
	]);
</script>

<svelte:head>
	<title>{place?.name} · Wardrobe</title>
</svelte:head>

{#if place}
	{#if hasQuery}
		<PageHeader
			title={place.name}
			subtitle="{place.description ?? ''} · {plural(here.length, 'piece')}"
			addLabel="Add to {place.name}"
		/>
		<Verdict />
		<ItemGrid items={visible} emptyTitle="Nothing like this here" />
	{:else}
		<div class="place">
			<h1>{place.name}</h1>
			<div class="grid">
				{#each tiles as tile, i (tile.href)}
					<a class="cat" href={tile.href} style:animation-delay="{i * 50}ms">
						<span class="square">
							<svg viewBox="0 0 120 120" aria-hidden="true"><path d={tile.icon} /></svg>
						</span>
						<span class="name">{tile.label}</span>
					</a>
				{/each}
			</div>
			<button type="button" class="mpill" onclick={() => w.openQuick()}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					aria-hidden="true"><path d="M8 3v10M3 8h10"></path></svg
				>
				Add to {place.name}
			</button>
		</div>
	{/if}
{/if}

<style>
	.place {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 44px;
		min-height: calc(100dvh - 120px);
	}
	h1 {
		margin: 0;
		font-size: 64px;
		line-height: 1;
		font-weight: 500;
		letter-spacing: -0.035em;
		animation: fadeDown 0.7s var(--ease-out) both;
	}
	/* sized so all eleven squares fit on a desktop screen without scrolling */
	.grid {
		--sq: clamp(100px, min(calc((100dvh - 440px) / 2), calc((100vw - 200px) / 6)), 220px);
		display: grid;
		grid-template-columns: repeat(6, var(--sq));
		gap: 32px 24px;
		justify-content: center;
	}
	.cat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		color: inherit;
		text-decoration: none;
		animation: rise 0.6s var(--ease-out) backwards;
	}
	.square {
		width: 100%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 30px;
		background: var(--surface);
		border: 1px solid #e6e4de;
		box-shadow:
			0 34px 60px -38px rgba(29, 29, 27, 0.35),
			0 3px 10px -6px rgba(29, 29, 27, 0.08);
		transition: transform 0.2s;
	}
	.cat:active .square {
		transform: scale(0.98);
	}
	svg {
		width: 48%;
		height: auto;
		fill: none;
		stroke: var(--ink-2);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.name {
		font-size: 18px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink-2);
		text-align: center;
	}
	@media (max-width: 760px) {
		.place {
			gap: 24px;
			min-height: calc(100dvh - 108px);
		}
		h1 {
			font-size: 34px;
		}
		/* two squares per row on a phone */
		.grid {
			--sq: clamp(120px, calc((100vw - 48px) / 2), 200px);
			grid-template-columns: repeat(2, var(--sq));
			gap: 14px 16px;
		}
		.cat {
			gap: 8px;
		}
		.square {
			border-radius: 22px;
		}
		.name {
			font-size: 15px;
		}
	}
</style>
