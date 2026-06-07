<script lang="ts">
	import type { Snippet } from 'svelte';

	type Accent = 'mint' | 'lavender' | 'yellow' | 'pink';

	interface Props {
		title?: string;
		accent?: Accent;
		fill?: boolean;
		scrollable?: boolean;
		titleIcon?: Snippet;
		children: Snippet;
	}

	let {
		title = '',
		accent = 'mint',
		fill = false,
		scrollable = false,
		titleIcon,
		children
	}: Props = $props();

	const accentVar = $derived(`var(--${accent})`);
</script>

<section class="accent-card" class:fill class:scrollable style="--accent-color: {accentVar}">
	<div class="accent-strip"></div>
	<svg class="corner-star" viewBox="0 0 24 24" fill="var(--yellow)" aria-hidden="true">
		<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
	</svg>

	{#if title}
		<h2 class="card-title">
			{#if titleIcon}
				<span class="title-icon" aria-hidden="true">
					{@render titleIcon()}
				</span>
			{/if}
			{title}
		</h2>
	{/if}

	<div class="card-body">
		{@render children()}
	</div>
</section>

<style>
	.accent-card {
		position: relative;
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 1.35rem 1.5rem 1.5rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
		text-align: right;
		overflow: hidden;
	}

	.accent-card.fill {
		height: 100%;
	}

	.accent-card.scrollable {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.accent-card.scrollable .card-body {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.accent-strip {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: 4px;
		background: var(--accent-color);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	}

	.corner-star {
		position: absolute;
		top: 1rem;
		inset-inline-start: 1rem;
		width: 1rem;
		height: 1rem;
		opacity: 0.55;
	}

	.card-title {
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 0.45rem;
		margin: 0 0 0.85rem;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.title-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--accent-color) 40%, white);
		flex-shrink: 0;
	}

	.title-icon :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
		color: var(--text-primary);
	}

	.card-body {
		position: relative;
		z-index: 1;
	}
</style>
