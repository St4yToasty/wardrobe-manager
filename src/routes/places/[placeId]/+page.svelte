<script lang="ts">
	import { resolve } from '$app/paths';
	import { ICONS, type IconKey } from '#lib/wardrobe/icons.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const tiles = $derived([
		...data.types.map((t) => ({
			href: resolve('/places/[placeId]/[type]', { placeId: data.place.id, type: t.slug }),
			label: t.label,
			icon: ICONS[t.icon as IconKey] ?? ICONS.tee
		})),
		{
			href: resolve('/places/[placeId]/[type]', { placeId: data.place.id, type: 'all' }),
			label: 'Everything',
			icon: ICONS.all
		}
	]);
</script>

<svelte:head>
	<title>{data.place.name} · Wardrobe</title>
</svelte:head>

<main class="place">
	<h1>{data.place.name}</h1>

	<div class="grid">
		{#each tiles as tile, i (tile.href)}
			<a class="cat" href={tile.href} style:animation-delay="{60 + i * 35}ms">
				<span class="square">
					<svg viewBox="0 0 120 120" aria-hidden="true"><path d={tile.icon} /></svg>
				</span>
				<span class="name">{tile.label}</span>
			</a>
		{/each}
	</div>
</main>

<style>
	.place {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 44px;
		min-height: 100dvh;
		padding: 96px 40px 24px;
	}
	h1 {
		margin: 0;
		font-size: 64px;
		line-height: 1;
		font-weight: 500;
		letter-spacing: -0.035em;
		animation: fade-down 0.7s var(--ease-out) both;
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
		border-radius: var(--r-square);
		background: var(--surface);
		border: 1px solid #e6e4de;
		box-shadow: var(--float-shadow);
		transition: transform var(--t-fast);
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
	}

	@media (max-width: 760px) {
		.place {
			gap: 24px;
			padding: 84px 16px 24px;
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
