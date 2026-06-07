<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';
	import { SEGMENT_ACCENTS } from '$lib/prompts/lesson';
	import type { Lesson } from '$lib/types/lesson';

	let lessons = $state<Lesson[]>([]);
	let loading = $state(true);
	let errorMsg = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/history');
			if (!res.ok) {
				if (isUnauthorized(res)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(res, 'שגיאה בטעינת ההיסטוריה'));
			}
			const data = await res.json();
			lessons = data.lessons;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בטעינה';
		} finally {
			loading = false;
		}
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('he-IL', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<main class="history-page">
	<div class="history-shell">
		<DecorativeBg />

		<div class="history-content">
			<AppHeader variant="sub" title="מה למדתי" wide />

			{#if loading}
				<p class="status">טוען...</p>
			{:else if errorMsg}
				<p class="error">{errorMsg}</p>
			{:else if lessons.length === 0}
				<div class="history-empty">
					<svg viewBox="0 0 24 24" fill="var(--mint)" aria-hidden="true">
						<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
					</svg>
					<p>עדיין לא למדת כלום — התחל עכשיו!</p>
				</div>
			{:else}
				<ul class="lesson-list">
					{#each lessons as lesson, i}
						<li>
							<a
								href="/lesson?id={lesson.id}"
								class="lesson-item"
								style="border-inline-start-color: {SEGMENT_ACCENTS[i % SEGMENT_ACCENTS.length]}"
								aria-label="צפה בשיעור: {lesson.topic_title}"
							>
								<div class="lesson-meta">
									<span class="domain">{lesson.domain}</span>
									<div class="meta-end">
										{#if lesson.enjoyment}
											<span class="rating">{lesson.enjoyment}/5</span>
										{/if}
										<span class="date">{formatDate(lesson.created_at)}</span>
									</div>
								</div>
								<h2>{lesson.topic_title}</h2>
								{#if lesson.segments?.[0]}
									<p class="preview">{lesson.segments[0]}</p>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</main>

<style>
	.history-page {
		min-height: 100dvh;
		padding: 0 1.25rem 2.5rem;
	}

	.history-shell {
		position: relative;
		max-width: 1400px;
		margin: 0 auto;
		min-height: calc(100dvh - 2rem);
	}

	.history-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status,
	.error {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
		font-size: 0.9rem;
	}

	.error {
		color: #c62828;
	}

	.history-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		padding: 2.5rem 0.5rem;
		text-align: center;
	}

	.history-empty svg {
		width: 1.5rem;
		height: 1.5rem;
		opacity: 0.8;
	}

	.history-empty p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.lesson-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.65rem;
	}

	.lesson-item {
		display: block;
		text-decoration: none;
		color: inherit;
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1rem 1.15rem;
		box-shadow: 0 2px 8px var(--shadow);
		border-inline-start: 3px solid var(--mint);
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}

	.lesson-item:hover,
	.lesson-item:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px var(--shadow);
		outline: 2px solid var(--mint);
		outline-offset: 2px;
	}

	.lesson-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}

	.meta-end {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-shrink: 0;
	}

	.domain {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--lavender);
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-pill);
	}

	.rating {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--accent);
		background: color-mix(in srgb, var(--yellow) 50%, white);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-pill);
	}

	.date {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.lesson-item h2 {
		margin: 0 0 0.35rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.preview {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (min-width: 900px) {
		.history-page {
			padding: 0 2.5rem 3rem;
		}

		.lesson-list {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.85rem;
		}
	}

	@media (min-width: 1200px) {
		.lesson-list {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
