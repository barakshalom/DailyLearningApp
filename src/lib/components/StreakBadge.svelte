<script lang="ts">
	interface Props {
		count: number;
		todayPending?: boolean;
		todayEarned?: boolean;
		size?: 'sm' | 'md';
		showLabel?: boolean;
	}

	let {
		count,
		todayPending = false,
		todayEarned = false,
		size = 'md',
		showLabel = true
	}: Props = $props();

	const isActive = $derived(count > 0 && (todayEarned || !todayPending));
	const isPending = $derived(todayPending && count > 0);
</script>

<div class="streak-badge" class:sm={size === 'sm'} class:md={size === 'md'}>
	<div class="streak-row">
		<span class="streak-count">{count}</span>
		<span
			class="fire-wrap"
			class:sm={size === 'sm'}
			class:md={size === 'md'}
			class:active={isActive}
			class:pending={isPending}
			class:muted={count === 0}
			aria-hidden="true"
		>
			<svg class="fire" viewBox="0 0 24 24" fill="none">
				<path
					class="flame-outer"
					d="M12 22c4.5-2.5 7-6.2 7-10.5C19 6.8 16.2 4 12 2 7.8 4 5 6.8 5 11.5 5 15.8 7.5 19.5 12 22z"
					fill="currentColor"
				/>
				<path
					class="flame-inner"
					d="M12 18.5c2.2-1.2 3.5-3.2 3.5-5.5 0-2.5-1.6-4.5-3.5-5.8-1.9 1.3-3.5 3.3-3.5 5.8 0 2.3 1.3 4.3 3.5 5.5z"
					fill="currentColor"
					opacity="0.65"
				/>
			</svg>
		</span>
	</div>

	{#if showLabel}
		<span class="streak-label">
			רצף
			{#if isPending}
				<span class="pending-tag">היום</span>
			{/if}
		</span>
	{/if}
</div>

<style>
	.streak-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.streak-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		line-height: 1.2;
	}

	.fire-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		flex-shrink: 0;
	}

	.fire-wrap.md .fire {
		width: 1.35rem;
		height: 1.35rem;
	}

	.fire-wrap.sm .fire {
		width: 1.1rem;
		height: 1.1rem;
	}

	.fire-wrap.active {
		color: #e8a030;
		filter: drop-shadow(0 0 6px color-mix(in srgb, var(--yellow) 80%, #e8a030));
		animation: fire-pulse 2s ease-in-out infinite;
	}

	.fire-wrap.pending {
		color: var(--text-muted);
		opacity: 0.55;
	}

	.fire-wrap.muted {
		color: var(--text-muted);
		opacity: 0.4;
	}

	.flame-outer {
		fill: currentColor;
	}

	.flame-inner {
		fill: color-mix(in srgb, var(--yellow) 60%, white);
	}

	.fire-wrap.active .flame-inner {
		fill: color-mix(in srgb, var(--yellow) 40%, #fff5d6);
	}

	.streak-count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.sm .streak-count {
		font-size: 1.1rem;
	}

	.streak-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.sm .streak-label {
		font-size: 0.7rem;
	}

	.pending-tag {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted);
		background: color-mix(in srgb, var(--lavender) 40%, var(--bg));
		padding: 0.1rem 0.35rem;
		border-radius: var(--radius-pill);
	}

	@keyframes fire-pulse {
		0%,
		100% {
			transform: scale(1);
			filter: drop-shadow(0 0 4px color-mix(in srgb, var(--yellow) 60%, #e8a030));
		}
		50% {
			transform: scale(1.08);
			filter: drop-shadow(0 0 10px color-mix(in srgb, var(--pink) 50%, #e8a030));
		}
	}
</style>
