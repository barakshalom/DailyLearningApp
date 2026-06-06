<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';
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
	<AppHeader variant="sub" title="מה למדתי" showSettings wide />

	{#if loading}
		<p class="status">טוען...</p>
	{:else if errorMsg}
		<p class="error">{errorMsg}</p>
	{:else if lessons.length === 0}
		<p class="status">עדיין לא למדת כלום — התחל עכשיו!</p>
	{:else}
		<ul class="lesson-list">
			{#each lessons as lesson}
				<li class="lesson-item">
					<div class="lesson-meta">
						<span class="domain">{lesson.domain}</span>
						<span class="date">{formatDate(lesson.created_at)}</span>
					</div>
					<h2>{lesson.topic_title}</h2>
					<p class="preview">{lesson.segments[0]}</p>
					{#if lesson.enjoyment}
						<span class="badge" class:liked={lesson.enjoyment >= 3}>
							{lesson.enjoyment}/5
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.history-page {
		padding: 1.5rem 1.25rem 3rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.status,
	.error {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
	}

	.error {
		color: #c62828;
	}

	.lesson-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.85rem;
	}

	.lesson-item {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		box-shadow: 0 4px 16px var(--shadow);
	}

	.lesson-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.domain {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--lavender);
		padding: 0.25rem 0.65rem;
		border-radius: var(--radius-pill);
	}

	.date {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.lesson-item h2 {
		margin: 0 0 0.5rem;
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.preview {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.badge {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.badge.liked {
		color: var(--accent);
	}

	@media (min-width: 900px) {
		.lesson-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.lesson-list {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
