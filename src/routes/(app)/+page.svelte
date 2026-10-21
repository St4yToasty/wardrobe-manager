<script lang="ts">
	import { resolve } from '$app/paths';
	import PlaceDrawing from '#lib/components/PlaceDrawing.svelte';
	import { useWardrobe } from '#lib/wardrobe/store.svelte.ts';

	const w = useWardrobe();
</script>

<div class="home">
	<h1>Wardrobe</h1>

	<div class="grid">
		{#each w.places as place, i (place.id)}
			<a
				class="place-btn"
				href={resolve('/(app)/places/[placeId]', { placeId: place.id })}
				style:animation-delay="{120 + i * 100}ms"
			>
				<span class="float" style:animation-delay={i ? '-3.5s' : '0s'}>
					<span class="square"><PlaceDrawing kind={place.kind} /></span>
				</span>
				<span class="name">{place.name}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 56px;
		min-height: calc(100dvh - 120px);
	}
	h1 {
		margin: 0;
		font-size: 64px;
		line-height: 1;
		font-weight: 500;
		letter-spacing: -0.035em;
		animation: fadeDown 0.7s var(--ease-out) both;
	}
	.grid {
		--sq: clamp(140px, min(calc(100dvh - 310px), calc((100vw - 136px) / 2)), 340px);
		display: grid;
		grid-template-columns: repeat(2, var(--sq));
		gap: 56px;
		justify-content: center;
	}
	.place-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 22px;
		color: inherit;
		text-decoration: none;
		animation: rise 0.8s var(--ease-out) backwards;
	}
	.float {
		width: 100%;
		animation: float 7s ease-in-out infinite;
	}
	.square {
		width: 100%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 36px;
		background: var(--surface);
		border: 1px solid #e6e4de;
		box-shadow:
			0 40px 70px -40px rgba(29, 29, 27, 0.38),
			0 4px 14px -6px rgba(29, 29, 27, 0.08);
		transition:
			transform 0.6s var(--ease-out),
			box-shadow 0.8s ease,
			border-color 0.9s ease;
	}
	.place-btn:hover .square {
		transform: translateY(-6px);
		border-color: var(--line-strong);
		box-shadow:
			0 60px 90px -44px rgba(29, 29, 27, 0.42),
			0 6px 18px -8px rgba(29, 29, 27, 0.1);
	}
	.place-btn:active .square {
		transform: translateY(-2px) scale(0.99);
	}
	.name {
		font-size: 20px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink-2);
		transition: color 0.4s;
	}
	.place-btn:hover .name {
		color: var(--ink);
	}
	@media (max-width: 760px) {
		.home {
			gap: 36px;
			min-height: calc(100dvh - 108px);
		}
		h1 {
			font-size: 44px;
		}
		.grid {
			--sq: clamp(120px, min(calc(100dvh - 230px), calc((100vw - 50px) / 2)), 220px);
			gap: 18px;
		}
		.square {
			border-radius: 26px;
		}
		.name {
			font-size: 17px;
		}
	}
</style>
