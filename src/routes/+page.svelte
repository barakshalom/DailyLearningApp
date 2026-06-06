<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';
	import TopicPicker from '$lib/components/TopicPicker.svelte';
	import { getSelectedTopic, setSelectedTopic } from '$lib/selected-topic';
	import type { Lesson, LessonPayload } from '$lib/types/lesson';
	import type { TopicKey } from '$lib/topics';

	let selectedTopic = $state<TopicKey>('random');
	let allLessons = $state<Lesson[]>([]);
	let recentLessons = $state<Lesson[]>([]);
	let unfinishedLesson = $state<LessonPayload | null>(null);
	let totalLessons = $state(0);
	let avgRating = $state<string>('—');
	let loading = $state(true);
	let starting = $state(false);
	let errorMsg = $state('');

	function computeAvgRating(lessons: Lesson[]): string {
		const rated = lessons.filter((l) => l.enjoyment != null);
		if (rated.length === 0) return '—';
		const sum = rated.reduce((acc, l) => acc + (l.enjoyment ?? 0), 0);
		return (sum / rated.length).toFixed(1);
	}

	onMount(async () => {
		selectedTopic = getSelectedTopic();

		try {
			const [historyRes, lessonRes] = await Promise.all([
				fetch('/api/history'),
				fetch('/api/lesson')
			]);

			if (!historyRes.ok) {
				if (isUnauthorized(historyRes)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(historyRes, 'שגיאה בטעינת ההיסטוריה'));
			}

			const historyData = await historyRes.json();
			allLessons = historyData.lessons as Lesson[];
			totalLessons = allLessons.length;
			avgRating = computeAvgRating(allLessons);
			recentLessons = allLessons.slice(0, 6);

			if (lessonRes.ok) {
				const lessonData = await lessonRes.json();
				const latest = lessonData.lesson as LessonPayload | null;
				if (latest && latest.enjoyment === null) {
					unfinishedLesson = latest;
				}
			}
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בטעינה';
		} finally {
			loading = false;
		}
	});

	function handleTopicChange(topic: TopicKey) {
		selectedTopic = topic;
		setSelectedTopic(topic);
	}

	async function startLesson() {
		setSelectedTopic(selectedTopic);
		starting = true;
		await goto('/lesson?start=1');
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('he-IL', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class="page">
	<AppHeader />

	<main class="home-main">
		<div class="home-shell">
			<DecorativeBg />

			<div class="home-grid">
				{#if !loading && totalLessons > 0}
					<div class="stats-row">
						<div class="stat-pill">
							<span class="stat-value">{totalLessons}</span>
							<span class="stat-label">שיעורים</span>
						</div>
						<div class="stat-pill">
							<span class="stat-value">{avgRating}</span>
							<span class="stat-label">דירוג ממוצע</span>
						</div>
					</div>
				{/if}

				{#if unfinishedLesson}
					<div class="resume-banner">
						<div class="resume-text">
							<strong>יש לך שיעור שלא סיימת</strong>
							<p>{unfinishedLesson.topicTitle}</p>
						</div>
						<a href="/lesson" class="resume-btn">המשך שיעור</a>
					</div>
				{/if}

				<div class="home-left">
					<section class="hero-card">
						<h1>מה נלמד היום?</h1>
						<p>
							בחר נושא שמעניין אותך וקבל שיעור קצר של כ-5 דקות — רעיון אחד חדש, מוסבר
							בצורה ברורה וזכירה.
						</p>
					</section>

					<section class="topic-card">
						<h2>מה תרצה ללמוד?</h2>
						<TopicPicker value={selectedTopic} onchange={handleTopicChange} />
					</section>

					<button type="button" class="start-btn" disabled={starting} onclick={startLesson}>
						{#if starting}
							טוען...
						{:else}
							התחל שיעור
						{/if}
					</button>

					{#if errorMsg}
						<p class="error">{errorMsg}</p>
					{/if}
				</div>

				<aside class="home-right">
					<section class="recent-section">
						<div class="recent-header">
							<h2>למדת לאחרונה</h2>
							{#if recentLessons.length > 0}
								<a href="/history" class="nav-pill">הכל</a>
							{/if}
						</div>

						{#if loading}
							<p class="recent-status">טוען...</p>
						{:else if recentLessons.length === 0}
							<p class="recent-empty">עדיין לא למדת — התחל שיעור ראשון!</p>
						{:else}
							<ul class="recent-list">
								{#each recentLessons as lesson}
									<li class="recent-item">
										<div class="recent-meta">
											<span class="domain">{lesson.domain}</span>
											<span class="date">{formatDate(lesson.created_at)}</span>
										</div>
										<h3>{lesson.topic_title}</h3>
										{#if lesson.segments?.[0]}
											<p class="preview">{lesson.segments[0]}</p>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				</aside>
			</div>
		</div>
	</main>
</div>

<style>
	.page {
		min-height: 100dvh;
		padding: 0 1.25rem 2.5rem;
	}

	.home-main {
		width: 100%;
	}

	.home-shell {
		position: relative;
		max-width: 1400px;
		margin: 0 auto;
	}

	.home-grid {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.stats-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.stat-pill {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		background: var(--surface);
		border-radius: var(--radius-pill);
		padding: 0.6rem 1.1rem;
		box-shadow: 0 2px 10px var(--shadow);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.stat-label {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.resume-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		background: var(--yellow);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		box-shadow: 0 4px 16px var(--shadow);
	}

	.resume-text strong {
		display: block;
		font-size: 0.9rem;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.resume-text p {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.resume-btn {
		flex-shrink: 0;
		padding: 0.65rem 1.25rem;
		border-radius: var(--radius-pill);
		background: var(--card-dark);
		color: white;
		font-size: 0.9rem;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 2px 10px var(--shadow);
	}

	.home-left {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hero-card {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--mint) 40%, white),
			color-mix(in srgb, var(--lavender) 40%, white)
		);
		border-radius: var(--radius-xl);
		padding: 1.75rem 1.5rem;
		box-shadow: 0 4px 20px var(--shadow);
		text-align: center;
	}

	.topic-card {
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 1.5rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
		text-align: right;
	}

	.hero-card h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.hero-card p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--text-muted);
	}

	.topic-card h2,
	.recent-section h2 {
		margin: 0 0 0.85rem;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.start-btn {
		width: 100%;
		padding: 1.15rem 1.5rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--mint);
		color: var(--card-dark);
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 6px 24px var(--shadow-lg);
		transition: transform 0.15s;
	}

	.start-btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.start-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.recent-section {
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 1.25rem 1.5rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
		height: 100%;
	}

	.recent-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.recent-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.recent-item {
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1rem 1.15rem;
		box-shadow: 0 2px 8px var(--shadow);
	}

	.recent-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.35rem;
	}

	.domain {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--lavender);
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-pill);
	}

	.date {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.recent-item h3 {
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

	.recent-status,
	.recent-empty {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 0;
	}

	.error {
		text-align: center;
		color: #c62828;
		font-size: 0.9rem;
	}

	@media (min-width: 900px) {
		.page {
			padding: 0 2.5rem 3rem;
		}

		.home-grid {
			display: grid;
			grid-template-columns: 1fr min(480px, 35%);
			gap: 1.5rem;
			align-items: start;
		}

		.stats-row,
		.resume-banner {
			grid-column: 1 / -1;
		}

		.hero-card {
			padding: 2rem;
		}

		.hero-card h1 {
			font-size: 2rem;
		}

		.home-right {
			position: sticky;
			top: 1.5rem;
		}
	}
</style>
