<script lang="ts">
	interface Props {
		index: number;
	}

	let { index }: Props = $props();

	const colors = ['var(--yellow)', 'var(--pink)', 'var(--mint)', 'var(--lavender)'] as const;
	const color = $derived(colors[index % colors.length]);
</script>

<span class="icon-wrap" style="background: {color}">
	{#if index === 0}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
	{:else if index === 1}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z"
				stroke="currentColor"
				stroke-width="2"
			/>
		</svg>
	{:else if index === 2}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="2" />
			<path d="M4 10h16" stroke="currentColor" stroke-width="2" />
		</svg>
	{:else if index === 3}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M4 8h16M4 12h12M4 16h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if index === 4}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
			<path d="M2 12h20M12 3a15 15 0 010 18M12 3a15 15 0 000 18" stroke="currentColor" stroke-width="2" />
		</svg>
	{:else if index === 5}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if index === 6}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M8 9h8a4 4 0 010 8H8a4 4 0 010-8z"
				stroke="currentColor"
				stroke-width="2"
			/>
			<path d="M12 9V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
			<path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	{/if}
</span>

<style>
	.icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		flex-shrink: 0;
		color: var(--text-primary);
	}

	.icon-wrap svg {
		width: 1.1rem;
		height: 1.1rem;
	}
</style>
