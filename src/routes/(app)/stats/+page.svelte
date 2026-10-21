<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { statistics, type Row } from '#lib/wardrobe/stats.ts';
	import PageHeader from '#lib/components/PageHeader.svelte';

	const w = useWardrobe();
	const st = $derived(statistics(w, w.statsPlace));
	const segs = $derived([
		{ id: 'all', label: 'Both places' },
		...w.places.map((p) => ({ id: p.id, label: p.name }))
	]);
</script>

<svelte:head>
	<title>Statistics · Wardrobe</title>
</svelte:head>

{#snippet bars(rows: Row[], colour = false)}
	{#each rows as r, i (r.label)}
		<div class="brow" title={r.tip}>
			<span class="blabel"
				>{#if colour}<span class="cdot" style:background={r.hex}></span>{/if}{r.label}</span
			>
			<span class="btrack"
				><span
					class="bar"
					class:sw={colour}
					style:width="{r.w}%"
					style:background={colour ? r.hex : undefined}
					style:animation-delay="{120 + i * 60}ms"
				></span></span
			>
			<span class="bval">{r.value}</span>
		</div>
	{/each}
{/snippet}

<PageHeader
	title="Statistics"
	subtitle="What your wardrobe is made of, and what it’s worth."
	addLabel="Quick add"
/>

<div class="stats">
	<div class="seg" role="group" aria-label="Place" style="align-self: flex-start">
		{#each segs as s (s.id)}
			<button
				type="button"
				class:on={w.statsPlace === s.id}
				aria-pressed={w.statsPlace === s.id}
				onclick={() => {
					if (w.statsPlace !== s.id) {
						w.statsPlace = s.id;
						w.anim++;
					}
				}}>{s.label}</button
			>
		{/each}
	</div>

	{#key w.anim}
		<div class="kpis">
			{#each st.kpis as k, i (k.label)}
				<div class="kpi" style:animation-delay="{i * 50}ms">
					<span class="kl">{k.label}</span>
					<span class="kv">{k.value}</span>
					<span class="kn">{k.note}</span>
				</div>
			{/each}
		</div>

		<div class="charts">
			<section class="chart" style="animation-delay: 80ms">
				<h3>Pieces by type</h3>
				<div>{@render bars(st.byType)}</div>
			</section>
			<section class="chart" style="animation-delay: 140ms">
				<h3>Value by type</h3>
				<div>{@render bars(st.valueByType)}</div>
			</section>
			<section class="chart" style="animation-delay: 200ms">
				<h3>Pieces by brand</h3>
				<div>{@render bars(st.byBrand)}</div>
			</section>
			<section class="chart" style="animation-delay: 260ms">
				<h3>Pieces by colour</h3>
				<div>{@render bars(st.byColour, true)}</div>
			</section>
			{#if w.statsPlace === 'all' && st.placeA && st.placeB}
				<section class="chart" style="animation-delay: 320ms">
					<h3>Where each type is kept</h3>
					<div class="legend">
						<span><span class="lsw" style="background: var(--place-a)"></span>{st.placeA.name}</span
						>
						<span><span class="lsw" style="background: var(--place-b)"></span>{st.placeB.name}</span
						>
					</div>
					<div>
						{#each st.split as r, i (r.label)}
							<div class="brow" title={r.tip}>
								<span class="blabel">{r.label}</span>
								<span class="btrack">
									<span
										class="bar"
										style:width="{r.aw}%"
										style:background="var(--place-a)"
										style:border-radius={r.aOnly ? '0 4px 4px 0' : '0'}
										style:animation-delay="{120 + i * 60}ms"
									></span>
									<span
										class="bar"
										style:width="{r.bw}%"
										style:background="var(--place-b)"
										style:animation-delay="{120 + i * 60}ms"
									></span>
								</span>
								<span class="bval">{r.value}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
			<section class="chart" style="animation-delay: 380ms">
				<h3>Pieces added per year</h3>
				{#if st.byYear.length}
					<div class="cols">
						{#each st.byYear as y, i (y.label)}
							<div class="col" title={y.tip}>
								<span class="cv">{y.value}</span>
								<span class="colbar" style:height="{y.h}%" style:animation-delay="{150 + i * 80}ms"
								></span>
							</div>
						{/each}
					</div>
					<div class="collabels">
						{#each st.byYear as y (y.label)}<span>{y.label}</span>{/each}
					</div>
				{:else}
					<p class="none">Nothing added yet.</p>
				{/if}
			</section>
		</div>
	{/key}
</div>

<style>
	.stats {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 12px;
	}
	.kpi {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		animation: rise 0.6s var(--ease-out) backwards;
	}
	.kl {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.kv {
		font-size: 30px;
		font-weight: 500;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.kn {
		font-size: 13px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.charts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
		gap: 16px;
	}
	.chart {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 22px;
		padding: 22px 22px 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
		animation: rise 0.65s var(--ease-out) backwards;
	}
	h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
	}
	.brow {
		display: grid;
		grid-template-columns: 104px minmax(0, 1fr) 60px;
		align-items: center;
		gap: 12px;
		font-size: 13px;
		padding: 5px 8px;
		margin: 0 -8px;
		border-radius: 8px;
		transition: background 0.25s;
	}
	.brow:hover {
		background: #f1f0eb;
	}
	.blabel {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--ink-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.btrack {
		display: flex;
		gap: 2px;
		height: 12px;
	}
	.bar {
		height: 12px;
		border-radius: 0 4px 4px 0;
		background: #4a4a47;
		transform-origin: left center;
		animation: grow 0.9s var(--ease-out) backwards;
	}
	.bar.sw {
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}
	.bval {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		color: var(--ink);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		font-size: 12px;
		color: var(--ink-2);
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.lsw {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}
	.cols {
		display: flex;
		align-items: flex-end;
		gap: 14px;
		height: 170px;
		border-bottom: 1px solid var(--line-2);
		padding: 0 4px;
	}
	.col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 6px;
		height: 100%;
		font-size: 13px;
	}
	.cv {
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.colbar {
		width: 100%;
		max-width: 56px;
		border-radius: 4px 4px 0 0;
		background: #4a4a47;
		transform-origin: bottom center;
		transition: filter 0.2s;
		animation: growY 0.9s var(--ease-out) backwards;
	}
	.col:hover .colbar {
		filter: brightness(1.25);
	}
	.collabels {
		display: flex;
		gap: 14px;
		padding: 0 4px;
	}
	.collabels span {
		flex: 1;
		text-align: center;
		font-size: 12px;
		color: var(--muted);
	}
	.none {
		margin: 0;
		font-size: 14px;
		color: var(--muted);
	}
	@media (max-width: 520px) {
		.charts {
			grid-template-columns: minmax(0, 1fr);
		}
		.brow {
			grid-template-columns: 84px minmax(0, 1fr) 52px;
		}
	}
</style>
