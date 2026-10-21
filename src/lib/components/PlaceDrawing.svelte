<script lang="ts">
	import type { PlaceKind } from '#lib/wardrobe/types.ts';

	// Outline drawing of a place. The grey drawing sits underneath; a dark copy
	// draws itself over it when the parent (.place-btn) is hovered or focused.
	let { kind }: { kind: PlaceKind } = $props();
</script>

<span class="pic">
	{#if kind === 'flat'}
		<svg class="base" viewBox="0 0 200 200" role="img" aria-label="Apartment building">
			{@render flat()}
		</svg>
		<svg class="draw" viewBox="0 0 200 200" aria-hidden="true">{@render flat()}</svg>
	{:else}
		<svg class="base" viewBox="0 0 240 200" role="img" aria-label="Two-storey house">
			{@render house()}
		</svg>
		<svg class="draw" viewBox="0 0 240 200" aria-hidden="true">{@render house()}</svg>
	{/if}
</span>

{#snippet flat()}
	<rect pathLength="1" x="62" y="28" width="76" height="150" rx="2" />
	<path pathLength="1" d="M34 178H166" />
	<path pathLength="1" d="M90 178V150H110V178" />
	<rect pathLength="1" x="80" y="50" width="14" height="16" />
	<rect pathLength="1" x="106" y="50" width="14" height="16" />
	<rect pathLength="1" x="80" y="82" width="14" height="16" />
	<rect pathLength="1" x="106" y="82" width="14" height="16" />
	<rect pathLength="1" x="80" y="114" width="14" height="16" />
	<rect pathLength="1" x="106" y="114" width="14" height="16" />
{/snippet}

{#snippet house()}
	<path pathLength="1" d="M48 92L120 38L192 92Z" />
	<rect pathLength="1" x="60" y="92" width="120" height="90" />
	<path pathLength="1" d="M146 57.5V46H160V68" />
	<path pathLength="1" d="M14 182H226" />
	<path pathLength="1" d="M60 134H180" />
	<circle pathLength="1" cx="120" cy="70" r="7" />
	<rect pathLength="1" x="78" y="100" width="26" height="22" />
	<rect pathLength="1" x="136" y="100" width="26" height="22" />
	<rect pathLength="1" x="78" y="146" width="26" height="22" />
	<rect pathLength="1" x="134" y="144" width="24" height="38" />
{/snippet}

<style>
	.pic {
		position: relative;
		display: block;
		width: 74%;
		transition: transform 0.8s var(--ease-out);
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		fill: none;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.base {
		stroke: var(--drawing-idle);
	}
	.draw {
		position: absolute;
		inset: 0;
		stroke: var(--ink);
		stroke-linecap: butt;
	}
	.draw :global(*) {
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		transition: stroke-dashoffset 0.42s var(--ease-in-out);
	}
	.draw :global(*:nth-child(2)) {
		transition-delay: 0.07s;
	}
	.draw :global(*:nth-child(n + 3)) {
		transition-delay: 0.14s;
	}
	:global(.place-btn:hover) .draw :global(*),
	:global(.place-btn:focus-visible) .draw :global(*) {
		stroke-dashoffset: 0;
	}
	:global(.place-btn:hover) .pic {
		transform: scale(1.03);
	}
</style>
