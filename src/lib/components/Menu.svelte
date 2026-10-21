<script lang="ts">
	import { resolve } from '$app/paths';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';

	// Round floating button (top-left) that drops down a column of outline pills.
	// Everything is fixed-position, so opening it never moves the page.
	let { view, placeId }: { view: string; placeId?: string } = $props();
	const w = useWardrobe();

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && w.menuOpen && !w.panel) w.menuOpen = false;
	}
</script>

<svelte:window onkeydown={onKey} />

<div
	class="navscrim"
	class:off={!w.menuOpen}
	onclick={() => (w.menuOpen = false)}
	aria-hidden="true"
></div>

<button
	type="button"
	class="menubtn"
	class:is-open={w.menuOpen}
	aria-label={w.menuOpen ? 'Close menu' : 'Open menu'}
	aria-expanded={w.menuOpen}
	aria-controls="main-menu"
	onclick={() => (w.menuOpen = !w.menuOpen)}
>
	<span class="burger" aria-hidden="true"><span></span><span></span><span></span></span>
</button>

<nav class="side" class:rail={!w.menuOpen} id="main-menu" aria-label="Main" inert={!w.menuOpen}>
	<div class="sinner">
		<a class="navpill" class:on={view === 'home'} href={resolve('/(app)')}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"
				aria-hidden="true"><path d="M3 9l7-5.5L17 9v8H3z"></path><path d="M8 17v-5h4v5"></path></svg
			>
			<span>Places</span>
		</a>
		{#each w.places as p (p.id)}
			<a
				class="navpill"
				class:on={(view === 'place' || view === 'items') && placeId === p.id}
				href={resolve('/(app)/places/[placeId]', { placeId: p.id })}
			>
				{#if p.kind === 'flat'}
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
						aria-hidden="true"
						><rect x="5" y="2.5" width="10" height="15"></rect><path
							d="M8 6h1M11 6h1M8 9h1M11 9h1M8 12h1M11 12h1M9 17.5v-2.5h2v2.5"
							stroke-linecap="round"
						></path></svg
					>
				{:else}
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
						aria-hidden="true"
						><path d="M2.5 9L10 3l7.5 6"></path><path d="M4.5 7.5V17h11V7.5M4.5 12h11M8.5 17v-3h3v3"
						></path></svg
					>
				{/if}
				<span>{p.name}</span>
				<span class="cnt">{w.inPlace(p.id).length}</span>
			</a>
		{/each}
		<a class="navpill" class:on={view === 'all'} href={resolve('/(app)/all')}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
				><rect x="3" y="3" width="5.5" height="5.5" rx="1.5"></rect><rect
					x="11.5"
					y="3"
					width="5.5"
					height="5.5"
					rx="1.5"
				></rect><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5"></rect><rect
					x="11.5"
					y="11.5"
					width="5.5"
					height="5.5"
					rx="1.5"
				></rect></svg
			>
			<span>All clothing</span>
			<span class="cnt">{w.items.length}</span>
		</a>
		<a class="navpill" class:on={view === 'stats'} href={resolve('/(app)/stats')}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				aria-hidden="true"><path d="M3 17h14M5.5 14V9M10 14V4.5M14.5 14v-7"></path></svg
			>
			<span>Statistics</span>
		</a>
		<a class="navpill" class:on={view === 'add'} href={resolve('/(app)/add')}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"
				aria-hidden="true"
				><path d="M3 6.5h3l1.5-2h5l1.5 2h3V16H3z"></path><circle cx="10" cy="11" r="3"
				></circle></svg
			>
			<span>Add a piece</span>
		</a>
		<span class="gap" aria-hidden="true"></span>
		<form method="POST" action={resolve('/logout')}>
			<button type="submit" class="navpill">
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d="M8 4H4.5v12H8M12 6.5L15.5 10 12 13.5M15.5 10H8"></path></svg
				>
				<span>Sign out</span>
			</button>
		</form>
	</div>
</nav>

<style>
	.menubtn {
		position: fixed;
		top: 18px;
		left: 18px;
		z-index: 42;
		width: 52px;
		height: 52px;
		padding: 0;
		border-radius: 50%;
		border: 1px solid #e4e2dc;
		background: rgba(252, 251, 249, 0.92);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow:
			0 16px 34px -18px rgba(29, 29, 27, 0.45),
			inset 0 1px 0 #ffffff;
		display: grid;
		place-items: center;
		transition:
			background 0.25s ease,
			border-color 0.25s ease,
			transform 0.3s var(--ease-out);
	}
	.menubtn:hover {
		background: var(--ink);
		border-color: var(--ink);
	}
	.menubtn:hover .burger span {
		background: var(--ground);
	}
	.menubtn:active {
		transform: scale(0.95);
	}
	.burger {
		position: relative;
		width: 18px;
		height: 12px;
	}
	.burger span {
		position: absolute;
		left: 0;
		width: 18px;
		height: 1.6px;
		border-radius: 2px;
		background: var(--ink);
		transition:
			transform 0.35s var(--ease-out),
			opacity 0.2s,
			top 0.35s var(--ease-out),
			background 0.25s ease;
	}
	.burger span:nth-child(1) {
		top: 0;
	}
	.burger span:nth-child(2) {
		top: 5.2px;
	}
	.burger span:nth-child(3) {
		top: 10.4px;
	}
	.is-open .burger span:nth-child(1) {
		top: 5.2px;
		transform: rotate(45deg);
	}
	.is-open .burger span:nth-child(2) {
		opacity: 0;
	}
	.is-open .burger span:nth-child(3) {
		top: 5.2px;
		transform: rotate(-45deg);
	}

	.navscrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(246, 245, 241, 0.55);
		opacity: 1;
		visibility: visible;
		transition:
			opacity 0.35s ease,
			visibility 0s;
	}
	.navscrim.off {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0s 0.55s;
	}

	.side {
		position: fixed;
		top: 82px;
		left: 18px;
		z-index: 41;
		max-height: calc(100vh - 100px);
		overflow-y: auto;
		padding: 4px 24px 24px 2px;
		margin-left: -2px;
		opacity: 1;
		visibility: visible;
		transform: none;
		transition:
			opacity 0.2s ease,
			transform 0.3s var(--ease-out),
			visibility 0s;
	}
	.side.rail {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(-8px) scale(0.98);
		transform-origin: top left;
		transition:
			opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
			visibility 0s 0.45s;
	}
	.sinner {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
	.sinner > :global(*) {
		flex: none;
	}
	.side:not(.rail) .sinner > :global(*) {
		animation: pillIn 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(2)) {
		animation-delay: 25ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(3)) {
		animation-delay: 50ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(4)) {
		animation-delay: 75ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(5)) {
		animation-delay: 100ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(6)) {
		animation-delay: 125ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(7)) {
		animation-delay: 150ms;
	}
	.side:not(.rail) .sinner > :global(*:nth-child(n + 8)) {
		animation-delay: 175ms;
	}
	.navpill {
		justify-content: flex-start;
		width: 208px;
		height: 48px;
		gap: 10px;
		padding: 0 18px 0 16px;
	}
	.navpill svg {
		flex: none;
	}
	.cnt {
		margin-left: auto;
		font-size: 12px;
		font-weight: 400;
		color: #4a4a47;
		transition: color 0.25s ease;
	}
	.navpill:hover .cnt,
	.navpill.on .cnt {
		color: #c9c7c1;
	}
	.gap {
		height: 6px;
	}
	form {
		margin: 0;
	}
	@keyframes pillIn {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.94);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 760px) {
		.menubtn {
			top: 14px;
			left: 14px;
		}
		.side {
			top: 76px;
			left: 14px;
			max-height: calc(100vh - 90px);
		}
	}
</style>
