<script lang="ts">
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';

	// Page title block: optional breadcrumb pill, title, subtitle, and the add button on the right.
	let {
		title,
		subtitle,
		crumb,
		addLabel
	}: {
		title: string;
		subtitle: string;
		crumb?: { label: string; href: string };
		addLabel?: string;
	} = $props();
	const w = useWardrobe();
</script>

<header>
	<div class="left">
		{#if crumb}
			<div class="crumbs">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is already resolved by the caller -->
				<a class="crumb" href={crumb.href}>{crumb.label}</a>
			</div>
		{/if}
		<h1 class="title">{title}</h1>
		<p class="subtitle">{subtitle}</p>
	</div>
	{#if addLabel}
		<button type="button" class="mpill" onclick={() => w.openQuick()}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				aria-hidden="true"><path d="M8 3v10M3 8h10"></path></svg
			>
			{addLabel}
		</button>
	{/if}
</header>

<style>
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
	}
	.left {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
</style>
