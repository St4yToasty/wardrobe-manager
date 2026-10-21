<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { euro } from '#lib/wardrobe/format.ts';
	import type { Item } from '#lib/wardrobe/types.ts';

	let { items, emptyTitle }: { items: Item[]; emptyTitle: string } = $props();
	const w = useWardrobe();
</script>

{#if items.length}
	{#key w.anim}
		<div class="grid">
			{#each items as it, i (it.id)}
				{@const thumb = w.thumbUrl(it)}
				{@const hex = w.hex(it.colour)}
				<article
					class="card"
					class:leaving={w.leaving === it.id}
					class:fresh={w.fresh === it.id}
					style:animation-delay="{Math.min(i * 40, 480)}ms"
				>
					<button
						type="button"
						class="open"
						aria-label="Open {it.name}"
						onclick={() => w.openDetail(it.id)}
					></button>
					<div class="ph">
						<span class="tag">{w.typeLabel(it.type)}</span>
						{#if thumb}
							<img src={thumb} alt={it.name} loading="lazy" decoding="async" />
						{:else}
							<svg viewBox="0 0 120 120" aria-hidden="true"
								><path
									d={w.icon(it)}
									fill={hex}
									stroke="#2B2B29"
									stroke-opacity="0.5"
									stroke-width="1.5"
									stroke-linejoin="round"
									stroke-linecap="round"
								></path></svg
							>
						{/if}
					</div>
					<button
						type="button"
						class="rm"
						aria-label="Remove {it.name}"
						onclick={() => w.remove(it)}
					>
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"></path></svg
						>
					</button>
					<div class="meta">
						<div class="row">
							<span class="nm">{it.name}</span>
							<span class="price">{euro(it.price)}</span>
						</div>
						<div class="row sub">
							<span class="cl"
								><span class="cdot" style:background={hex}></span>{[it.colour, it.brand]
									.filter(Boolean)
									.join(' · ')}</span
							>
							<span class="where">{w.placeName(it.place_id)}</span>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/key}
{:else}
	<div class="empty">
		<svg
			width="40"
			height="40"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#6B6A66"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			><path
				d="M10 6.5a2 2 0 1 1 2 2c-.9 0-1.4.6-1.4 1.3V10.4L3.4 15.6A1 1 0 0 0 4 17.4h16a1 1 0 0 0 .6-1.8L12 10"
			></path></svg
		>
		<div class="et">{emptyTitle}</div>
		<p>Try another word, or add something new to this spot.</p>
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
			Add a piece here
		</button>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 20px;
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
		letter-spacing: -0.01em;
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
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--muted);
	}
	.cl {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.where {
		white-space: nowrap;
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		padding: 72px 24px;
		border: 1px dashed #d6d4cd;
		border-radius: 24px;
		text-align: center;
		animation: fadeDown 0.45s var(--ease-out) both;
	}
	.et {
		font-size: 18px;
		font-weight: 500;
	}
	.empty p {
		margin: 0;
		font-size: 14px;
		color: var(--muted);
		max-width: 360px;
	}
	@media (max-width: 760px) {
		.empty {
			padding: 48px 20px;
		}
	}
</style>
