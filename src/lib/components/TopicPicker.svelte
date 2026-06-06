<script lang="ts">
	import {
		PRIMARY_TOPICS,
		MORE_TOPICS,
		isMoreTopic,
		type TopicKey
	} from '$lib/topics';

	interface Props {
		value: TopicKey;
		disabled?: boolean;
		onchange: (key: TopicKey) => void;
	}

	let { value, disabled = false, onchange }: Props = $props();

	let expanded = $state(false);

	const selectedMoreTopic = $derived(
		isMoreTopic(value) ? MORE_TOPICS.find((t) => t.key === value) : undefined
	);

	const visibleMoreTopics = $derived(expanded ? MORE_TOPICS : []);
</script>

<div class="topic-picker" role="radiogroup" aria-label="בחירת נושא">
	{#each PRIMARY_TOPICS as topic}
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

	{#if selectedMoreTopic && !expanded}
		<button
			type="button"
			class="topic-chip selected"
			role="radio"
			aria-checked={true}
			{disabled}
			onclick={() => onchange(selectedMoreTopic.key)}
		>
			{selectedMoreTopic.label}
		</button>
	{/if}

	{#each visibleMoreTopics as topic}
		{#if !selectedMoreTopic || topic.key !== selectedMoreTopic.key || expanded}
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
		{/if}
	{/each}

	<button
		type="button"
		class="more-toggle"
		aria-expanded={expanded}
		{disabled}
		onclick={() => (expanded = !expanded)}
	>
		{expanded ? 'פחות' : 'עוד+'}
	</button>
</div>

<style>
	.topic-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		justify-content: start;
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

	.topic-chip:hover:not(:disabled):not(.selected) {
		border-color: var(--lavender);
		background: color-mix(in srgb, var(--lavender) 35%, var(--bg));
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

	.more-toggle {
		padding: 0.45rem 0.75rem;
		border: 1.5px solid var(--lavender);
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--lavender) 20%, var(--bg));
		color: var(--text-primary);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.more-toggle:hover:not(:disabled) {
		background: color-mix(in srgb, var(--lavender) 35%, var(--bg));
	}

	.more-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
