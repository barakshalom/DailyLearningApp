<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
	}

	let { size = 'md' }: Props = $props();
</script>

<div class="logo" class:sm={size === 'sm'} class:lg={size === 'lg'}>
	<svg class="logo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"
			fill="currentColor"
		/>
		<path
			d="M6 14.5h12v2.5a2 2 0 01-2 2H8a2 2 0 01-2-2v-2.5z"
			fill="currentColor"
			opacity="0.85"
		/>
	</svg>
	<span class="logo-text">למידה יומית</span>
</div>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-primary);
	}

	.logo-icon {
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
	}

	.logo-text {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.logo.sm .logo-icon {
		width: 1.35rem;
		height: 1.35rem;
	}

	.logo.sm .logo-text {
		font-size: 0.85rem;
	}

	.logo.lg .logo-icon {
		width: 2.25rem;
		height: 2.25rem;
	}

	.logo.lg .logo-text {
		font-size: 1.35rem;
	}
</style>
