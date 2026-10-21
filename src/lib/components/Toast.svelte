<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';
	const w = useWardrobe();
</script>

{#if w.toast}
	<div class="toast" class:out={w.toastOut} role="status">
		<span>{w.toast.text}</span>
		{#if w.toast.undo}
			<button type="button" class="undo" onclick={() => w.undo()}>Undo</button>
		{:else}
			<span style="width: 14px"></span>
		{/if}
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 50%;
		bottom: calc(28px + env(safe-area-inset-bottom));
		z-index: 60;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 8px 8px 22px;
		min-height: 52px;
		max-width: calc(100vw - 32px);
		background: var(--ink);
		color: var(--ground);
		border-radius: 999px;
		font-size: 14px;
		box-shadow: 0 20px 40px -18px rgba(0, 0, 0, 0.5);
		white-space: nowrap;
		animation: toastIn 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	.toast > span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.toast.out {
		animation: toastOut 0.24s ease both;
	}
	.undo {
		height: 36px;
		padding: 0 16px;
		border: 1px solid var(--ground);
		border-radius: 999px;
		background: var(--ground);
		color: var(--ink);
		font-size: 13px;
		font-weight: 500;
		transition:
			background 0.25s ease,
			color 0.25s ease;
	}
	.undo:hover {
		background: transparent;
		color: var(--ground);
	}
	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translate(-50%, 18px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
	@keyframes toastOut {
		from {
			opacity: 1;
			transform: translate(-50%, 0);
		}
		to {
			opacity: 0;
			transform: translate(-50%, 12px);
		}
	}
</style>
