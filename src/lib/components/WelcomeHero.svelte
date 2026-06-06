<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppLogo from '$lib/components/AppLogo.svelte';

	interface Props {
		subtitle?: string;
		logoSize?: 'md' | 'lg';
		children?: Snippet;
	}

	let {
		subtitle = '5 דקות ביום, משהו חדש ללמוד',
		logoSize = 'lg',
		children
	}: Props = $props();
</script>

<section class="welcome-hero">
	<svg class="corner-star" viewBox="0 0 24 24" fill="var(--yellow)" aria-hidden="true">
		<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
	</svg>

	<div class="logo-wrap">
		<AppLogo size={logoSize} />
	</div>
	<p class="subtitle">{subtitle}</p>

	{#if children}
		<div class="extras">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.welcome-hero {
		position: relative;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--mint) 40%, white),
			color-mix(in srgb, var(--lavender) 40%, white)
		);
		border-radius: var(--radius-xl);
		padding: 2rem 1.5rem 1.75rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
		text-align: center;
	}

	.corner-star {
		position: absolute;
		top: 1rem;
		inset-inline-start: 1rem;
		width: 1.25rem;
		height: 1.25rem;
		opacity: 0.7;
	}

	.logo-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--text-muted);
	}

	.extras {
		margin-top: 1.25rem;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	@media (min-width: 900px) {
		.welcome-hero {
			padding: 2.5rem 2rem 2rem;
		}

		.subtitle {
			font-size: 1.05rem;
		}
	}
</style>
