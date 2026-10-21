<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { tokens } from '#lib/wardrobe/search.ts';

	// "Do I already own this?" answer, always across the whole wardrobe.
	const w = useWardrobe();
	const hasQuery = $derived(tokens(w.q).length > 0);
	const owned = $derived(hasQuery ? w.items.filter((it) => w.matches(it, w.q)) : []);
	const where = $derived(
		w.places
			.map((p) => {
				const n = owned.filter((it) => it.place_id === p.id).length;
				return n ? `${n} in ${p.name}` : '';
			})
			.filter(Boolean)
			.join(', ')
	);
</script>

{#if hasQuery}
	<div class="wrapv">
		{#key owned.length > 0}
			{#if owned.length}
				<div class="verdict">
					<span class="vicon" style="background: #1D1D1B">
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							stroke="#F6F5F1"
							stroke-width="1.6"
							stroke-linecap="round"
							aria-hidden="true"><path d="M6 3v3.5M6 8.6v.1"></path></svg
						>
					</span>
					<span
						><strong
							>You already own {owned.length}
							{owned.length === 1 ? 'piece' : 'pieces'} like this</strong
						>: {where}.</span
					>
				</div>
			{:else}
				<div class="verdict">
					<span class="vicon" style="border: 1.5px solid #1D1D1B">
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							stroke="#1D1D1B"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"><path d="M3 6.2l2 2 4-4.4"></path></svg
						>
					</span>
					<span><strong>Not in your wardrobe.</strong> Clear to buy,</span>
					<button type="button" class="linkbtn" onclick={() => w.openQuick(w.q.trim())}
						>add it after</button
					>
				</div>
			{/if}
		{/key}
	</div>
{/if}

<style>
	.wrapv {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.verdict {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		color: var(--ink-2);
		animation: fadeDown 0.4s var(--ease-out) both;
	}
	strong {
		font-weight: 600;
	}
</style>
