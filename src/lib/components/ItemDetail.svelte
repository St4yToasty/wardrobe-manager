<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { useWardrobe, monthYear } from '#lib/wardrobe/store.svelte.ts';
	import { euro } from '#lib/wardrobe/format.ts';
	import type { Item } from '#lib/wardrobe/types.ts';

	let { item }: { item: Item } = $props();
	const w = useWardrobe();
	let panel = $state<HTMLElement>();

	// Notes save quietly while typing.
	// svelte-ignore state_referenced_locally
	let notes = $state(item.notes ?? '');
	let timer: ReturnType<typeof setTimeout> | undefined;
	function saveNotes() {
		clearTimeout(timer);
		const v = notes.trim() || null;
		if (v !== (item.notes ?? null)) void w.update(item.id, { notes: v });
	}
	function onNotes() {
		clearTimeout(timer);
		timer = setTimeout(saveNotes, 600);
	}
	onDestroy(saveNotes);
	onMount(() => panel?.focus({ preventScroll: true }));

	const other = $derived(w.otherPlace(item.place_id));
	const photo = $derived(w.photoUrl(item));
	const hasPhoto = $derived(w.hasPhoto(item));
	const busy = $derived(!!w.busyPhotos[item.id]);
</script>

<div
	class="scrim"
	class:in={!w.panelOut}
	class:out={w.panelOut}
	onclick={() => w.closePanel()}
	aria-hidden="true"
></div>
<div
	bind:this={panel}
	class="panel"
	class:in={!w.panelOut}
	class:out={w.panelOut}
	role="dialog"
	aria-modal="true"
	aria-label={item.name}
	tabindex="-1"
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			e.stopPropagation();
			w.closePanel();
		}
	}}
>
	<div class="head">
		<span class="kind">{w.typeLabel(item.type)}</span>
		<button type="button" class="iconbtn" aria-label="Close" onclick={() => w.closePanel()}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"></path></svg
			>
		</button>
	</div>
	<div class="body">
		<div class="ph big">
			{#if photo}
				<img src={photo} alt={item.name} />
			{:else}
				<svg viewBox="0 0 120 120" style="width: 42%" aria-hidden="true"
					><path
						d={w.icon(item)}
						fill={w.hex(item.colour)}
						stroke="#2B2B29"
						stroke-opacity="0.5"
						stroke-width="1.5"
						stroke-linejoin="round"
						stroke-linecap="round"
					></path></svg
				>
			{/if}
			{#if busy}<span class="scan" aria-hidden="true"></span>{/if}
			<div class="photo-actions">
				{#if hasPhoto}
					<button
						type="button"
						class="btn-ghost"
						style="height: 40px"
						disabled={busy}
						onclick={() => w.removePhoto(item)}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"></path></svg
						>
						Remove photo
					</button>
				{/if}
				<label class="btn-ghost" style="height: 40px; cursor: pointer">
					<input
						type="file"
						accept="image/*"
						class="sr"
						disabled={busy}
						onchange={(e) => {
							const f = e.currentTarget.files?.[0];
							if (f) void w.replacePhoto(item, f);
							e.currentTarget.value = '';
						}}
					/>
					{busy ? 'Uploading…' : hasPhoto ? 'Replace photo' : 'Add photo'}
				</label>
			</div>
		</div>
		<div class="nameline">
			<h2>{item.name}</h2>
			<span class="price">{euro(item.price) || 'No price'}</span>
		</div>
		<div class="info">
			<div>
				<span class="k">Colour</span><span class="v cl"
					><span class="cdot" style:background={w.hex(item.colour)}></span>{item.colour ??
						'Not set'}</span
				>
			</div>
			<div><span class="k">Brand</span><span class="v">{item.brand || 'Not set'}</span></div>
			<div><span class="k">Size</span><span class="v">{item.size || 'Not set'}</span></div>
			<div><span class="k">Kept in</span><span class="v">{w.placeName(item.place_id)}</span></div>
			<div><span class="k">Type</span><span class="v">{w.typeLabel(item.type)}</span></div>
			<div>
				<span class="k">Added</span><span class="v">{monthYear(item.added_on) || 'Not set'}</span>
			</div>
		</div>
		<div class="stack">
			<label class="lbl" for="d-notes">Notes</label>
			<textarea
				id="d-notes"
				class="field"
				placeholder="Add a note about this piece"
				bind:value={notes}
				oninput={onNotes}
				onblur={saveNotes}></textarea>
		</div>
	</div>
	<div class="panel-foot" style="justify-content: space-between">
		<button type="button" class="btn-ghost" onclick={() => w.closePanel(() => w.remove(item))}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"></path></svg
			>
			Remove
		</button>
		{#if other}
			<button type="button" class="btn-dark" onclick={() => w.move(item)}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"></path></svg
				>
				Move to {other.name}
			</button>
		{/if}
	</div>
</div>

<style>
	.panel:focus {
		outline: none;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 18px 6px 28px;
	}
	.kind {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.body {
		flex: 1;
		overflow-y: auto;
		padding: 10px 28px 28px;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.ph.big {
		aspect-ratio: 4 / 3;
		border-radius: 20px;
		flex: none;
	}
	.photo-actions {
		position: absolute;
		right: 12px;
		bottom: 12px;
		z-index: 2;
		display: flex;
		gap: 8px;
	}
	.photo-actions label:focus-within {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}
	.scan {
		position: absolute;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(
			180deg,
			rgba(252, 251, 249, 0),
			rgba(252, 251, 249, 0.55),
			rgba(252, 251, 249, 0)
		);
		animation: scan 1.2s ease-in-out infinite;
		z-index: 1;
	}
	.nameline {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
	}
	h2 {
		margin: 0;
		font-size: 26px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.price {
		font-size: 22px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.info {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		border-radius: 18px;
		overflow: hidden;
	}
	.info > div {
		background: var(--surface);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.k {
		font-size: 12px;
		color: var(--muted);
	}
	.v {
		font-size: 15px;
	}
	.v.cl {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	@media (max-width: 760px) {
		.head {
			padding: 14px 14px 4px 20px;
		}
		.body {
			padding: 8px 20px 24px;
		}
		.panel-foot {
			padding: 14px 20px 20px;
		}
	}
</style>
