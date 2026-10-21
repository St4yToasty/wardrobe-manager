<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let busy = $state(false);
</script>

<svelte:head>
	<title>Sign in · Wardrobe</title>
</svelte:head>

<main>
	<h1>Wardrobe</h1>

	<form
		method="POST"
		use:enhance={() => {
			busy = true;
			return async ({ update }) => {
				await update();
				busy = false;
			};
		}}
	>
		<label>
			<span class="label">Email</span>
			<input
				class="field"
				type="email"
				name="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
			/>
		</label>
		<label>
			<span class="label">Password</span>
			<input
				class="field"
				type="password"
				name="password"
				autocomplete="current-password"
				required
			/>
		</label>

		{#if form?.message}
			<p class="error" role="alert">{form.message}</p>
		{/if}

		<button class="pill primary" type="submit" disabled={busy}>
			{busy ? 'Signing in' : 'Sign in'}
		</button>
	</form>
</main>

<style>
	main {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		padding: 24px 16px;
	}
	h1 {
		margin: 0;
		font-size: 56px;
		line-height: 1;
		font-weight: 500;
		letter-spacing: -0.035em;
		animation: fade-down 0.7s var(--ease-out) both;
	}
	form {
		width: min(360px, 100%);
		display: flex;
		flex-direction: column;
		gap: 16px;
		animation: rise 0.65s var(--ease-out) 80ms backwards;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.error {
		margin: 0;
		font-size: 14px;
		color: var(--ink-2);
	}
	button {
		margin-top: 8px;
		width: 100%;
	}
</style>
