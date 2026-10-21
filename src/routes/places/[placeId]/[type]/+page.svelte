<script lang="ts">
	import { resolve } from '$app/paths';
	import { iconFor } from '#lib/wardrobe/icons.ts';
	import { euro } from '#lib/wardrobe/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.typeLabel} in {data.place.name} · Wardrobe</title>
</svelte:head>

<main class="wrap">
	<header>
		<a class="crumb" href={resolve('/places/[placeId]', { placeId: data.place.id })}
			>{data.place.name}</a
		>
		<h1>{data.typeLabel}</h1>
	</header>

	{#if data.items.length}
		<div class="grid">
			{#each data.items as item, i (item.id)}
				<article class="card" style:animation-delay="{i * 30}ms">
					<div class="ph">
						<svg viewBox="0 0 120 120" aria-hidden="true">
							<path d={iconFor(item)} fill={item.colours?.hex ?? '#A3A19B'} />
						</svg>
					</div>
					<div class="meta">
						<div class="row">
							<span class="nm">{item.name}</span>
							<span class="price">{euro(item.price)}</span>
						</div>
						<div class="row sub">
							<span>{[item.colour, item.brand, item.size].filter(Boolean).join(' · ')}</span>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<p class="empty">Nothing here yet.</p>
	{/if}
</main>

<style>
	.wrap {
		max-width: 1240px;
		margin: 0 auto;
		padding: 96px 40px 120px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}
	.crumb {
		display: inline-flex;
		align-items: center;
		height: 32px;
		padding: 0 14px;
		border: 1px solid var(--ink);
		border-radius: var(--r-pill);
		font-size: 13px;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		transition:
			background 0.25s ease,
			color 0.25s ease;
	}
	.crumb:hover {
		background: var(--ink);
		color: var(--ground);
	}
	h1 {
		margin: 0;
		font-size: 42px;
		line-height: 1.05;
		font-weight: 500;
		letter-spacing: -0.025em;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 20px;
	}
	.card {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--r-card);
		overflow: hidden;
		animation: rise 0.6s var(--ease-out) backwards;
	}
	.ph {
		aspect-ratio: 4 / 5;
		background: var(--surface-sunk);
		display: grid;
		place-items: center;
	}
	.ph svg {
		width: 56%;
		height: auto;
	}
	.ph path {
		stroke: #2b2b29;
		stroke-opacity: 0.5;
		stroke-width: 1.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.meta {
		padding: 14px 16px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
	}
	.nm {
		font-size: 15px;
		font-weight: 500;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.price {
		font-size: 14px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.sub {
		font-size: 13px;
		color: var(--muted);
	}
	.empty {
		color: var(--muted);
	}

	@media (max-width: 760px) {
		.wrap {
			padding: 84px 16px 110px;
		}
		h1 {
			font-size: 30px;
		}
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 12px;
		}
	}
</style>
