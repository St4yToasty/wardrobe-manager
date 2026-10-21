<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import type { PieceForm } from '#lib/wardrobe/form.svelte.ts';

	// The form fields shared by the quick-add panel ('quick') and the full page ('page').
	let { form, variant }: { form: PieceForm; variant: 'quick' | 'page' } = $props();
	const w = useWardrobe();
	const p = $derived(variant === 'quick' ? 'q' : 'p');
	const similar = $derived(form.similar);
	const brands = $derived(form.brandSuggestions);
</script>

<div class="stack">
	<label class="lbl" for="{p}-name">Name</label>
	<input
		id="{p}-name"
		class="field"
		placeholder="e.g. Linen shirt"
		bind:value={form.name}
		autocomplete="off"
	/>
</div>

<div class="stack g10">
	<span class="lbl">Type</span>
	<div class="wrapr">
		{#each w.types as t (t.slug)}
			<button
				type="button"
				class="chip"
				class:on={form.type === t.slug}
				aria-pressed={form.type === t.slug}
				onclick={() => (form.type = t.slug)}>{t.label}</button
			>
		{/each}
	</div>
</div>

<div class="stack g10">
	<span class="lbl">Colour <span class="soft">{form.colourLabel}</span></span>
	<div class="wrapr g10">
		{#each w.colours as c (c.name)}
			<button
				type="button"
				class="sw"
				class:on={form.colour === c.name}
				style:background={c.hex}
				aria-label={c.name}
				aria-pressed={form.colour === c.name}
				onclick={() => form.pickColour(c.name)}
			></button>
		{/each}
	</div>
</div>

<div class="stack">
	<label class="lbl" for="{p}-brand">Brand</label>
	<input
		id="{p}-brand"
		class="field"
		placeholder="Type or pick one of yours"
		bind:value={form.brand}
		autocomplete="off"
	/>
	{#if brands.length}
		<div class="wrapr center">
			{#if variant === 'page'}<span class="hint">{form.brandHint}</span>{/if}
			{#each brands as b, i (b)}
				<button
					type="button"
					class="bchip"
					style:animation-delay="{i * 40}ms"
					onclick={() => (form.brand = b)}>{b}</button
				>
			{/each}
		</div>
	{/if}
</div>

<div class="two">
	<div class="stack">
		<label class="lbl" for="{p}-size">Size</label>
		<input
			id="{p}-size"
			class="field"
			placeholder={variant === 'page' ? 'e.g. M, 32, 43' : 'Optional'}
			bind:value={form.size}
			autocomplete="off"
		/>
	</div>
	<div class="stack">
		<label class="lbl" for="{p}-price">Price</label>
		<div class="pre">
			<span>€</span><input
				id="{p}-price"
				class="field"
				inputmode="decimal"
				placeholder="0.00"
				value={form.price}
				oninput={(e) => {
					form.setPrice(e.currentTarget.value);
					e.currentTarget.value = form.price;
				}}
				autocomplete="off"
			/>
		</div>
	</div>
</div>

<div class="stack">
	<label class="lbl" for="{p}-notes">Notes</label>
	<textarea
		id="{p}-notes"
		class="field"
		placeholder={variant === 'page'
			? 'Optional, e.g. fits a bit small, needs a tailor, gift from…'
			: 'Optional'}
		bind:value={form.notes}></textarea>
</div>

<div class="stack g10">
	<span class="lbl">Where is it kept?</span>
	{#if variant === 'page'}
		<div class="places">
			{#each w.places as pl (pl.id)}
				<button
					type="button"
					class="place-pick"
					class:on={form.placeId === pl.id}
					aria-pressed={form.placeId === pl.id}
					onclick={() => (form.placeId = pl.id)}
				>
					<span class="pp"
						><span class="pn">{pl.name}</span><span class="sub">{pl.description}</span></span
					>
				</button>
			{/each}
		</div>
	{:else}
		<div class="seg" role="group" aria-label="Place" style="align-self: flex-start">
			{#each w.places as pl (pl.id)}
				<button
					type="button"
					class:on={form.placeId === pl.id}
					aria-pressed={form.placeId === pl.id}
					onclick={() => (form.placeId = pl.id)}>{pl.name}</button
				>
			{/each}
		</div>
	{/if}
</div>

{#if similar.length}
	<div class="similar">
		<div class="sh">
			<span class="vicon" style="background: #1D1D1B"
				><svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					stroke="#F6F5F1"
					stroke-width="1.6"
					stroke-linecap="round"
					aria-hidden="true"><path d="M6 3v3.5M6 8.6v.1"></path></svg
				></span
			>
			<strong
				>You already own {similar.length} similar {similar.length === 1
					? 'piece'
					: 'pieces'}</strong
			>
		</div>
		{#each similar.slice(0, 4) as it, i (it.id)}
			<div class="srow" style:animation-delay="{i * 50}ms">
				<span class="cdot" style="width: 14px; height: 14px" style:background={w.hex(it.colour)}
				></span>
				<span class="sn">{[it.colour, it.name.toLowerCase()].filter(Boolean).join(' ')}</span>
				<span class="sm">{[it.brand, w.placeName(it.place_id)].filter(Boolean).join(' · ')}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.wrapr {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.wrapr.g10 {
		gap: 10px;
	}
	.wrapr.center {
		align-items: center;
	}
	.hint {
		font-size: 12px;
		color: var(--muted);
	}
	.places {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.pp {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.pn {
		font-weight: 500;
	}
	.place-pick .sub {
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sh {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
	}
	.sh strong {
		font-weight: 600;
	}
	.sn {
		flex: 1;
		font-size: 14px;
		font-weight: 500;
	}
	.sm {
		font-size: 13px;
		color: var(--muted);
	}
</style>
