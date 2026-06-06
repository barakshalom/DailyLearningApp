<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta name="theme-color" content="#b8e6d0" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--bg: #f4f3f8;
		--surface: #ffffff;
		--mint: #b8e6d0;
		--lavender: #d4c8f0;
		--yellow: #f5e6a3;
		--pink: #f5c4d8;
		--card-dark: #1a1a1a;
		--text-primary: #1a1a1a;
		--text-muted: #6b6b7b;
		--accent: #7c6bcf;
		--border: rgba(26, 26, 26, 0.08);
		--shadow: rgba(26, 26, 26, 0.07);
		--shadow-lg: rgba(26, 26, 26, 0.11);
		--radius-lg: 24px;
		--radius-xl: 28px;
		--radius-pill: 999px;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		direction: rtl;
	}

	:global(body) {
		margin: 0;
		font-family: 'Rubik', system-ui, sans-serif;
		background: var(--bg);
		color: var(--text-primary);
		-webkit-font-smoothing: antialiased;
		min-height: 100dvh;
	}
</style>
