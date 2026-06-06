<script lang="ts">
	interface Props {
		disabled?: boolean;
		loading?: boolean;
		embedded?: boolean;
		onclick: () => void;
	}

	let { disabled = false, loading = false, embedded = false, onclick }: Props = $props();
</script>

<div class="bottom-bar" class:embedded>
	<button type="button" class="cta" {disabled} onclick={disabled ? undefined : onclick}>
		{#if loading}
			<span class="spinner"></span>
			מכין שיעור חדש...
		{:else}
			למד משהו חדש
		{/if}
	</button>
</div>

<style>
	.bottom-bar {
		width: 100%;
	}

	.bottom-bar.embedded {
		padding: 0;
	}

	.cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem 1.5rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--card-dark);
		color: white;
		font-size: 1.05rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 6px 24px var(--shadow-lg);
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
		font-family: inherit;
	}

	.cta:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 8px 28px var(--shadow-lg), 0 0 0 2px var(--mint);
	}

	.cta:active:not(:disabled) {
		transform: translateY(0);
	}

	.cta:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		box-shadow: none;
	}

	.spinner {
		width: 1.1rem;
		height: 1.1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
