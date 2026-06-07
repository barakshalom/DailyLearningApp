<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';
	import WelcomeHero from '$lib/components/WelcomeHero.svelte';
	import AccentCard from '$lib/components/AccentCard.svelte';
	import TopicPicker from '$lib/components/TopicPicker.svelte';
	import StreakBadge from '$lib/components/StreakBadge.svelte';
	import { SEGMENT_ACCENTS } from '$lib/prompts/lesson';
	import { computeStreak } from '$lib/streak';
	import {
		getCustomTopic,
		getSelectedTopic,
		setCustomTopic,
		setSelectedTopic
	} from '$lib/selected-topic';
	import type { Lesson, LessonPayload } from '$lib/types/lesson';
	import type { TopicKey } from '$lib/topics';

	let selectedTopic = $state<TopicKey>('random');
	let customTopicText = $state('');
	let allLessons = $state<Lesson[]>([]);
	let recentLessons = $state<Lesson[]>([]);
	let unfinishedLesson = $state<LessonPayload | null>(null);
	let canStartNew = $state(true);
	let blockReason = $state<string | null>(null);
	let totalLessons = $state(0);
	let loading = $state(true);
	let starting = $state(false);
	let errorMsg = $state('');

	let streak = $derived(computeStreak(allLessons));
	let customTopicValid = $derived(
		selectedTopic !== 'custom' || customTopicText.trim().length >= 2
	);

	onMount(async () => {
		selectedTopic = getSelectedTopic();
		if (selectedTopic === 'custom') {
			customTopicText = getCustomTopic();
		}

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
			recentLessons = allLessons.slice(0, 6);

			if (lessonRes.ok) {
				const lessonData = await lessonRes.json();
				const latest = lessonData.lesson as LessonPayload | null;
				canStartNew = lessonData.canStartNew !== false;
				blockReason = (lessonData.blockReason as string | null) ?? null;
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

	function handleCustomTextChange(text: string) {
		customTopicText = text;
		setCustomTopic(text);
	}

	async function startLesson() {
		if (!customTopicValid) return;
		setSelectedTopic(selectedTopic);
		if (selectedTopic === 'custom') {
			setCustomTopic(customTopicText.trim());
		}
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
				<div class="welcome-wrap">
					<WelcomeHero logoSize="lg">
						{#if !loading && (totalLessons > 0 || streak.count > 0)}
							<div class="stat-tile mint">
								<span class="stat-value">{totalLessons}</span>
								<span class="stat-label">שיעורים</span>
							</div>
							<div class="stat-tile yellow">
								<StreakBadge
									count={streak.count}
									todayPending={streak.todayPending}
									todayEarned={streak.todayEarned}
								/>
							</div>
						{/if}
					</WelcomeHero>
				</div>

				<div class="home-left">
					<AccentCard title="מה תרצה ללמוד?" accent="lavender">
						<TopicPicker
							value={selectedTopic}
							customText={customTopicText}
							onchange={handleTopicChange}
							onCustomTextChange={handleCustomTextChange}
						/>
					</AccentCard>

					{#if unfinishedLesson}
						<div class="resume-compact">
							<div class="resume-compact-text">
								<span class="resume-label">שיעור פתוח</span>
								<span class="resume-topic">{unfinishedLesson.topicTitle}</span>
							</div>
							<a href="/lesson" class="resume-link">המשך שיעור</a>
						</div>
					{/if}

					<button
						type="button"
						class="start-btn"
						disabled={starting || !canStartNew || !customTopicValid}
						onclick={startLesson}
					>
						{#if starting}
							טוען...
						{:else if !canStartNew && blockReason}
							{blockReason}
						{:else if selectedTopic === 'custom' && !customTopicValid}
							הזן נושא ללמידה
						{:else}
							התחל שיעור
						{/if}
					</button>

					{#if selectedTopic === 'custom' && !customTopicValid && canStartNew}
						<p class="limit-hint">כתוב על מה תרצה ללמוד (לפחות 2 תווים)</p>
					{/if}

					{#if blockReason && !canStartNew && !unfinishedLesson}
						<p class="limit-hint">{blockReason}</p>
					{/if}

					{#if errorMsg}
						<p class="error">{errorMsg}</p>
					{/if}
				</div>

				<aside class="home-right">
					<AccentCard title="למדת לאחרונה" accent="yellow" fill>
						{#if recentLessons.length > 0}
							<div class="recent-header">
								<a href="/history" class="nav-pill">הכל</a>
							</div>
						{/if}

						{#if loading}
							<p class="recent-status">טוען...</p>
						{:else if recentLessons.length === 0}
							<div class="recent-empty">
								<svg viewBox="0 0 24 24" fill="var(--mint)" aria-hidden="true">
									<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
								</svg>
								<p>עדיין לא למדת — התחל שיעור ראשון!</p>
							</div>
						{:else}
							<ul class="recent-list">
								{#each recentLessons as lesson, i}
									<li>
										<a
											href="/lesson?id={lesson.id}"
											class="recent-item"
											style="border-inline-start-color: {SEGMENT_ACCENTS[i % SEGMENT_ACCENTS.length]}"
											aria-label="צפה בשיעור: {lesson.topic_title}"
										>
											<div class="recent-meta">
												<span class="domain">{lesson.domain}</span>
												<div class="meta-end">
													{#if lesson.enjoyment}
														<span class="rating">{lesson.enjoyment}/5</span>
													{/if}
													<span class="date">{formatDate(lesson.created_at)}</span>
												</div>
											</div>
											<h3>{lesson.topic_title}</h3>
											{#if lesson.segments?.[0]}
												<p class="preview">{lesson.segments[0]}</p>
											{/if}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</AccentCard>
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
		min-height: calc(100dvh - 5rem);
	}

	.home-grid {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.welcome-wrap {
		width: 100%;
	}

	.stat-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 6.5rem;
		min-height: 4.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 16px var(--shadow);
	}

	.stat-tile.mint {
		background: color-mix(in srgb, var(--mint) 55%, white);
	}

	.stat-tile.yellow {
		background: color-mix(in srgb, var(--yellow) 55%, white);
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.resume-compact {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--lavender) 30%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--lavender) 50%, var(--border));
	}

	.resume-compact-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
		text-align: right;
	}

	.resume-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.resume-topic {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.resume-link {
		flex-shrink: 0;
		padding: 0.45rem 0.9rem;
		border-radius: var(--radius-pill);
		border: 1.5px solid var(--lavender);
		background: var(--surface);
		color: var(--text-primary);
		font-size: 0.82rem;
		font-weight: 700;
		text-decoration: none;
		transition: background 0.15s;
	}

	.resume-link:hover {
		background: color-mix(in srgb, var(--lavender) 25%, var(--surface));
	}

	.home-left {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.start-btn {
		width: 100%;
		padding: 1.15rem 1.5rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--mint);
		color: var(--card-dark);
		font-size: 1.15rem;
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

	.recent-header {
		display: flex;
		justify-content: start;
		margin: -0.5rem 0 0.65rem;
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

	.recent-item:hover,
	.recent-item:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px var(--shadow);
		outline: 2px solid var(--mint);
		outline-offset: 2px;
	}

	.recent-meta {
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

	.recent-status {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 0;
	}

	.recent-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		padding: 1.5rem 0.5rem;
		text-align: center;
	}

	.recent-empty svg {
		width: 1.5rem;
		height: 1.5rem;
		opacity: 0.8;
	}

	.recent-empty p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.limit-hint {
		text-align: center;
		color: #6b5b4f;
		font-size: 0.85rem;
		margin: 0;
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
			grid-template-columns: 1fr min(520px, 38%);
			gap: 1.5rem;
			align-items: start;
		}

		.welcome-wrap {
			grid-column: 1 / -1;
		}

		.home-right {
			position: sticky;
			top: 1.5rem;
		}
	}
</style>
