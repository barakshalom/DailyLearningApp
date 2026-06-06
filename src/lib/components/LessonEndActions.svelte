<script lang="ts">
	interface Props {
		disabled?: boolean;
		loading?: boolean;
		onContinue: () => void;
		onHome: () => void;
	}

	let { disabled = false, loading = false, onContinue, onHome }: Props = $props();
</script>

<div class="lesson-end-actions">
	<button
		type="button"
		class="cta primary"
		{disabled}
		onclick={disabled || loading ? undefined : onContinue}
	>
		{#if loading}
			<span class="spinner"></span>
			מכין שיעור חדש...
		{:else}
			המשך באותו נושא
		{/if}
	</button>
	<button type="button" class="cta secondary" disabled={loading} onclick={onHome}>
		חזרה לבית
	</button>
</div>

<style>
	.lesson-end-actions {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		width: 100%;
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
		font-size: 1.05rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
	}

	.cta.primary {
		background: var(--card-dark);
		color: white;
		box-shadow: 0 6px 24px var(--shadow-lg);
	}

	.cta.primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 8px 28px var(--shadow-lg), 0 0 0 2px var(--mint);
	}

	.cta.secondary {
		background: var(--surface);
		color: var(--text-primary);
		border: 1px solid var(--border);
		box-shadow: 0 2px 10px var(--shadow);
	}

	.cta.secondary:hover:not(:disabled) {
		transform: translateY(-1px);
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
