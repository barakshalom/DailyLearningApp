<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';

	type Variant = 'main' | 'sub';

	interface Props {
		variant?: Variant;
		backHref?: string;
		backLabel?: string;
		title?: string;
		showSettings?: boolean;
		wide?: boolean;
	}

	let {
		variant = 'main',
		backHref = '/',
		backLabel = '← חזרה',
		title = '',
		showSettings = false,
		wide = false
	}: Props = $props();
</script>

<header class="app-header" class:sub={variant === 'sub'} class:wide={wide}>
	{#if variant === 'sub'}
		<AppLogo size="sm" />
		<div class="header-row">
			<a href={backHref} class="nav-pill">{backLabel}</a>
			{#if title}
				<h1 class="header-title">{title}</h1>
			{/if}
			{#if showSettings}
				<a href="/settings" class="nav-pill">הגדרות</a>
			{/if}
		</div>
	{:else}
		<AppLogo />
		<nav class="header-nav">
			<a href="/settings" class="nav-pill">הגדרות</a>
			<a href="/history" class="nav-pill">היסטוריה</a>
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
		flex-direction: column;
		align-items: stretch;
		max-width: 28rem;
	}

	.app-header.sub.wide {
		max-width: 1400px;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.75rem;
	}

	.header-title {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text-primary);
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
</style>
