<script lang="ts">
	interface Props {
		enjoyment: number | null;
		disabled?: boolean;
		saving?: boolean;
		embedded?: boolean;
		prompt?: string;
		onEnjoyment: (score: number) => void;
	}

	let {
		enjoyment,
		disabled = false,
		saving = false,
		embedded = false,
		prompt = 'כמה נהנית מהשיעור?',
		onEnjoyment
	}: Props = $props();
</script>

<div class="feedback-bar" class:disabled class:embedded>
	<p class="prompt">{prompt} {saving ? '(שומר...)' : ''}</p>

	<div class="dots" role="group" aria-label="דירוג הנאה">
		{#each [1, 2, 3, 4, 5] as score}
			<button
				type="button"
				class="dot"
				class:filled={enjoyment !== null && score <= enjoyment}
				class:selected={enjoyment === score}
				disabled={disabled || saving}
				onclick={() => onEnjoyment(score)}
				aria-label="{score} מתוך 5"
			>
				{score}
			</button>
		{/each}
	</div>
</div>

<style>
	.feedback-bar {
		background: #f0ecfa;
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		box-shadow: 0 4px 20px var(--shadow);
		transition: opacity 0.2s;
		text-align: center;
	}

	.feedback-bar.embedded {
		margin: 0;
		max-width: none;
	}

	.feedback-bar:not(.embedded) {
		margin: 0 1rem 1rem;
		max-width: 42rem;
		margin-inline: auto;
	}

	.feedback-bar.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.prompt {
		margin: 0 0 0.85rem;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.dots {
		display: flex;
		gap: 0.45rem;
		justify-content: center;
		background: var(--card-dark);
		padding: 0.45rem;
		border-radius: var(--radius-pill);
		width: fit-content;
		margin: 0 auto;
	}

	.dot {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.dot:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.25);
		color: white;
	}

	.dot.filled {
		background: var(--mint);
		color: var(--card-dark);
	}

	.dot.selected {
		box-shadow: 0 0 0 2px var(--mint);
	}

	.dot:disabled {
		cursor: not-allowed;
	}
</style>
