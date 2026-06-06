<script lang="ts">
	import { TOPIC_OPTIONS, type TopicKey } from '$lib/topics';

	interface Props {
		value: TopicKey;
		disabled?: boolean;
		onchange: (key: TopicKey) => void;
	}

	let { value, disabled = false, onchange }: Props = $props();
</script>

<div class="topic-picker" role="radiogroup" aria-label="בחירת נושא">
	{#each TOPIC_OPTIONS as topic}
		<button
			type="button"
			class="topic-chip"
			class:selected={value === topic.key}
			role="radio"
			aria-checked={value === topic.key}
			{disabled}
			onclick={() => onchange(topic.key)}
		>
			{topic.label}
		</button>
	{/each}
</div>

<style>
	.topic-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		justify-content: flex-end;
	}

	.topic-chip {
		padding: 0.45rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		background: var(--bg);
		color: var(--text-primary);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.topic-chip:hover:not(:disabled) {
		border-color: var(--mint);
	}

	.topic-chip.selected {
		background: var(--mint);
		border-color: var(--mint);
		color: var(--card-dark);
	}

	.topic-chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
