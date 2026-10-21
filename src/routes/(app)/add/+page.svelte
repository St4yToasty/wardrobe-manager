<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { PieceForm } from '#lib/wardrobe/form.svelte.ts';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PieceFields from '#lib/components/PieceFields.svelte';

	const w = useWardrobe();
	// Carry over what was typed in the quick-add panel, if that's how we got here.
	const form = w.handoff instanceof PieceForm ? w.handoff : new PieceForm(w, w.context);
	w.handoff = null;

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!form.canSave) return;
		const placeId = form.placeId;
		const type = form.type;
		const item = await form.save();
		if (item) await goto(resolve('/(app)/places/[placeId]/[type]', { placeId, type }));
	}
</script>

<svelte:head>
	<title>Add a piece · Wardrobe</title>
</svelte:head>

<PageHeader
	title="Add a piece"
	subtitle="Snap a photo, fill in the details, choose where it lives."
/>

<form class="addgrid" onsubmit={save}>
	<div class="col">
		<label class="drop">
			<input
				type="file"
				accept="image/*"
				class="sr"
				onchange={(e) => form.setPhoto(e.currentTarget.files?.[0])}
			/>
			{#if form.preview}
				<img src={form.preview} alt="The new piece" />
			{/if}
			{#if form.detect.status === 'busy'}
				<span class="scan" aria-hidden="true"></span>
			{/if}
			{#if !form.preview}
				<span class="prompt">
					<span class="cam">
						<svg
							width="24"
							height="24"
							viewBox="0 0 20 20"
							fill="none"
							stroke="#1D1D1B"
							stroke-width="1.4"
							stroke-linejoin="round"
							aria-hidden="true"
							><path d="M3 6.5h3l1.5-2h5l1.5 2h3V16H3z"></path><circle cx="10" cy="11" r="3"
							></circle></svg
						>
					</span>
					<span class="pt">Take or upload a photo</span>
					<span class="ps">We’ll read the colour from it. No photo? A drawing is used instead.</span
					>
				</span>
			{/if}
		</label>
		{#if form.preview}
			<button
				type="button"
				class="btn-ghost"
				style="align-self: flex-start; height: 40px"
				onclick={() => form.removePhoto()}
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
		<div class="smart">
			<div class="sh">
				<span class="st">Smart fill</span>
				<span class="ss">{form.detectStatus}</span>
			</div>
			<div class="srow2">
				<span class="k">Colour</span>
				{#if form.detect.status === 'busy'}
					<span class="shimmer"></span>
				{:else if form.detect.status === 'done'}
					<span class="found"
						><span
							class="cdot"
							style="width: 14px; height: 14px"
							style:background={w.hex(form.detect.colour)}
						></span>{form.detect.colour}<span class="from">· from photo</span></span
					>
				{:else}
					<span class="soft">Waiting for a photo</span>
				{/if}
			</div>
			<div class="srow2">
				<span class="k">Type</span>
				<span class="soft">Needs the vision model (planned)</span>
			</div>
		</div>
	</div>

	<div class="col fields">
		<PieceFields {form} variant="page" />
		<div class="actions">
			<button type="button" class="btn-ghost" onclick={() => goto(resolve('/(app)'))}>Cancel</button
			>
			<button type="submit" class="btn-dark" disabled={!form.canSave}>Add to wardrobe</button>
		</div>
	</div>
</form>

<style>
	.addgrid {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: 40px;
		align-items: start;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.col.fields {
		gap: 24px;
	}
	.drop {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 4/5;
		border: 1.5px dashed #cfccc4;
		border-radius: 24px;
		background: #f1f0eb;
		overflow: hidden;
		cursor: pointer;
		transition:
			border-color 0.3s,
			background 0.3s;
	}
	.drop:hover {
		border-color: #9e9c96;
		background: #edebe6;
	}
	.drop:focus-within {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}
	.drop img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		animation: fadeIn 0.5s ease both;
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
	.prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 24px;
		text-align: center;
	}
	.cam {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--surface);
		display: grid;
		place-items: center;
	}
	.pt {
		font-size: 16px;
		font-weight: 500;
	}
	.ps {
		font-size: 13px;
		color: var(--muted);
		max-width: 240px;
	}
	.smart {
		border: 1px solid var(--line);
		border-radius: 20px;
		background: var(--surface);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.sh {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.st {
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.ss {
		font-size: 12px;
		color: var(--muted);
	}
	.srow2 {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
	}
	.k {
		width: 84px;
		color: var(--muted);
		flex: none;
	}
	.soft {
		color: var(--muted);
	}
	.found {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		animation: fadeDown 0.4s both;
	}
	.from {
		font-size: 12px;
		color: var(--muted);
	}
	.shimmer {
		background: linear-gradient(90deg, #e9e7e1 0%, #f6f5f1 50%, #e9e7e1 100%);
		background-size: 200% 100%;
		animation: shim 1.1s linear infinite;
		border-radius: 6px;
		height: 12px;
		width: 120px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 10px;
		padding-top: 24px;
		border-top: 1px solid #eceae4;
	}
	@media (max-width: 900px) {
		.addgrid {
			grid-template-columns: minmax(0, 1fr);
			gap: 28px;
		}
		.drop {
			aspect-ratio: 4/3;
		}
	}
</style>
