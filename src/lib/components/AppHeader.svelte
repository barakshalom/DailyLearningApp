<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';

	type Variant = 'main' | 'sub';

	interface Props {
		variant?: Variant;
		backHref?: string;
		backLabel?: string;
		title?: string;
		wide?: boolean;
	}

	let {
		variant = 'main',
		backHref = '/',
		backLabel = '← חזרה',
		title = '',
		wide = false
	}: Props = $props();
</script>

<header class="app-header" class:sub={variant === 'sub'} class:wide={wide}>
	{#if variant === 'sub'}
		<div class="sub-bar">
			{#if title}
				<h1 class="header-title">{title}</h1>
			{/if}
			<a href={backHref} class="nav-pill back-link">{backLabel}</a>
		</div>
	{:else}
		<AppLogo size="md" />
		<nav class="header-nav">
			<a href="/settings" class="nav-pill" data-sveltekit-preload-data="hover">הגדרות</a>
			<a href="/history" class="nav-pill" data-sveltekit-preload-data="hover">היסטוריה</a>
		</nav>
	{/if}
</header>

<style>
	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 0 1rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.app-header.sub {
		display: block;
		max-width: 28rem;
	}

	.app-header.sub.wide {
		max-width: 1400px;
	}

	.sub-bar {
		position: relative;
		width: 100%;
		min-height: 2.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-title {
		margin: 0;
		width: 100%;
		padding-inline: 6rem;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text-primary);
		text-align: center;
		box-sizing: border-box;
	}

	.back-link {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
		z-index: 1;
	}

	.header-nav {
		display: flex;
		gap: 0.5rem;
	}

	:global(.nav-pill) {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
		background: var(--surface);
		padding: 0.5rem 1.1rem;
		border-radius: var(--radius-pill);
		text-decoration: none;
		box-shadow: 0 2px 10px var(--shadow);
		transition: transform 0.15s;
		flex-shrink: 0;
	}

	:global(.nav-pill:hover) {
		transform: translateY(-1px);
	}

	.back-link:hover {
		transform: translateY(calc(-50% - 1px));
	}
</style>
