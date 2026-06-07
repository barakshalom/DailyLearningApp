<script lang="ts">
	import {
		PRIMARY_TOPICS,
		MORE_TOPICS,
		CUSTOM_TOPIC,
		isMoreTopic,
		type TopicKey
	} from '$lib/topics';

	interface Props {
		value: TopicKey;
		customText?: string;
		disabled?: boolean;
		onchange: (key: TopicKey) => void;
		onCustomTextChange?: (text: string) => void;
	}

	let {
		value,
		customText = '',
		disabled = false,
		onchange,
		onCustomTextChange
	}: Props = $props();

	let expanded = $state(false);

	const selectedMoreTopic = $derived(
		isMoreTopic(value) ? MORE_TOPICS.find((t) => t.key === value) : undefined
	);

	const visibleMoreTopics = $derived(expanded ? MORE_TOPICS : []);
</script>

<div class="topic-picker-wrap">
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

		{#if value === CUSTOM_TOPIC.key && !expanded}
			<button
				type="button"
				class="topic-chip custom-chip selected"
				role="radio"
				aria-checked={true}
				{disabled}
				onclick={() => onchange(CUSTOM_TOPIC.key)}
			>
				{CUSTOM_TOPIC.label}
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

		{#if expanded}
			<button
				type="button"
				class="topic-chip custom-chip"
				class:selected={value === CUSTOM_TOPIC.key}
				role="radio"
				aria-checked={value === CUSTOM_TOPIC.key}
				{disabled}
				onclick={() => onchange(CUSTOM_TOPIC.key)}
			>
				{CUSTOM_TOPIC.label}
			</button>
		{/if}

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

	{#if value === 'custom'}
		<input
			type="text"
			class="custom-input"
			dir="rtl"
			placeholder="על מה תרצה ללמוד?"
			maxlength="80"
			value={customText}
			{disabled}
			oninput={(e) => onCustomTextChange?.(e.currentTarget.value)}
		/>
	{/if}
</div>

<style>
	.topic-picker-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.topic-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		justify-content: start;
	}

	.custom-input {
		width: 100%;
		padding: 0.65rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--bg);
		color: var(--text-primary);
		font-size: 0.9rem;
		font-family: inherit;
		box-shadow: 0 2px 8px var(--shadow);
	}

	.custom-input:focus {
		outline: 2px solid var(--mint);
		outline-offset: 2px;
		border-color: var(--mint);
	}

	.custom-input:disabled {
		opacity: 0.5;
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

	.custom-chip {
		border-style: dashed;
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
