<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	import { tokens } from '#lib/wardrobe/search.ts';

	// Small round button (top-right) that grows into a search field on focus or while in use.
	let { placeholder }: { placeholder: string } = $props();
	const w = useWardrobe();
	const hasQuery = $derived(tokens(w.q).length > 0);
	let input = $state<HTMLInputElement>();
</script>

<label class="fsearch" class:has-q={hasQuery || w.q.length > 0}>
	<span class="sr">Search your wardrobe</span>
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		stroke="#1D1D1B"
		stroke-width="1.6"
		stroke-linecap="round"
		aria-hidden="true"><circle cx="9" cy="9" r="6"></circle><path d="M13.5 13.5L17 17"></path></svg
	>
	<input
		bind:this={input}
		type="search"
		{placeholder}
		bind:value={w.q}
		autocomplete="off"
		enterkeyhint="search"
		onkeydown={(e) => e.key === 'Escape' && ((w.q = ''), input?.blur())}
	/>
	{#if w.q.length > 0}
		<button
			type="button"
			class="iconbtn"
			aria-label="Clear search"
			onclick={() => {
				w.q = '';
				w.anim++;
			}}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"></path></svg
			>
		</button>
	{/if}
</label>

<style>
	.fsearch {
		position: fixed;
		top: 18px;
		right: 18px;
		z-index: 39;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 52px;
		width: 52px;
		padding: 0 6px 0 15px;
		border-radius: 999px;
		border: 1px solid #e4e2dc;
		background: rgba(252, 251, 249, 0.92);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow:
			0 16px 34px -18px rgba(29, 29, 27, 0.45),
			inset 0 1px 0 #ffffff;
		cursor: pointer;
		overflow: hidden;
		transition:
			width 0.4s var(--ease-out),
			border-color 0.25s ease,
			background 0.25s ease;
	}
	.fsearch:hover {
		border-color: var(--line-strong);
	}
	.fsearch:focus-within,
	.fsearch.has-q {
		width: min(340px, calc(100vw - 100px));
		cursor: text;
		border-color: var(--line-strong);
	}
	svg {
		flex: none;
	}
	input {
		flex: 1;
		min-width: 0;
		height: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		font-size: 16px;
		opacity: 0;
		transition: opacity 0.2s;
	}
	input::-webkit-search-cancel-button {
		display: none;
	}
	input::placeholder {
		color: var(--placeholder);
	}
	.fsearch:focus-within input,
	.fsearch.has-q input {
		opacity: 1;
	}
	.iconbtn {
		width: 40px;
		height: 40px;
	}
	@media (max-width: 760px) {
		.fsearch {
			top: 14px;
			right: 14px;
		}
	}
</style>
