<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { PieceForm } from '#lib/wardrobe/form.svelte.ts';
	import PieceFields from './PieceFields.svelte';
	import { onMount } from 'svelte';

	const w = useWardrobe();
	const form = new PieceForm(w, { ...w.context, name: w.quickName });
	let panel = $state<HTMLElement>();

	onMount(() => panel?.querySelector<HTMLInputElement>('#q-name')?.focus({ preventScroll: true }));

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!form.canSave) return;
		w.closePanel();
		await form.save();
	}

	function openFull() {
		w.handoff = form;
		w.closePanel(() => goto(resolve('/(app)/add')));
	}
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
	aria-label="Quick add"
	tabindex="-1"
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			e.stopPropagation();
			w.closePanel();
		}
	}}
>
	<form onsubmit={save}>
		<div class="head">
			<h2>Quick add</h2>
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
		<div class="body panel-body">
			<div class="photo">
				<label class="thumb">
					<input
						type="file"
						accept="image/*"
						class="sr"
						onchange={(e) => form.setPhoto(e.currentTarget.files?.[0])}
					/>
					{#if form.preview}
						<img src={form.preview} alt="The new piece" />
					{:else}
						<svg
							width="22"
							height="22"
							viewBox="0 0 20 20"
							fill="none"
							stroke="#3A3936"
							stroke-width="1.4"
							stroke-linejoin="round"
							aria-hidden="true"
							><path d="M3 6.5h3l1.5-2h5l1.5 2h3V16H3z"></path><circle cx="10" cy="11" r="3"
							></circle></svg
						>
					{/if}
				</label>
				<div class="pt">
					<span class="pl">Photo</span>
					<span class="ps">{form.detectStatusLong}</span>
					{#if form.preview}
						<button
							type="button"
							class="linkbtn"
							style="align-self: flex-start"
							onclick={() => form.removePhoto()}>Remove photo</button
						>
					{/if}
				</div>
			</div>
			<PieceFields {form} variant="quick" />
			<button type="button" class="linkbtn" style="align-self: flex-start" onclick={openFull}
				>Open the full form</button
			>
		</div>
		<div class="panel-foot" style="justify-content: flex-end">
			<button type="button" class="btn-ghost" onclick={() => w.closePanel()}>Cancel</button>
			<button type="submit" class="btn-dark" disabled={!form.canSave}>Add to wardrobe</button>
		</div>
	</form>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.panel:focus {
		outline: none;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22px 18px 6px 28px;
	}
	h2 {
		margin: 0;
		font-size: 22px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.body {
		flex: 1;
		overflow-y: auto;
		padding: 18px 28px 28px;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.photo {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.thumb {
		position: relative;
		width: 72px;
		height: 72px;
		flex: none;
		border-radius: 16px;
		background: #f1f0eb;
		border: 1.5px dashed #cfccc4;
		display: grid;
		place-items: center;
		overflow: hidden;
		cursor: pointer;
	}
	.thumb img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumb:focus-within {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}
	.pt {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.pl {
		font-size: 14px;
		font-weight: 500;
	}
	.ps {
		font-size: 13px;
		color: var(--muted);
	}
	@media (max-width: 760px) {
		.head {
			padding: 18px 14px 4px 20px;
		}
		.body {
			padding: 14px 20px 24px;
		}
	}
</style>
