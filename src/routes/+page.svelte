<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import LessonView from '$lib/components/LessonView.svelte';
	import FeedbackBar from '$lib/components/FeedbackBar.svelte';
	import BottomAction from '$lib/components/BottomAction.svelte';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';
	import { feedbackFromEnjoyment } from '$lib/feedback';
	import type { LessonPayload } from '$lib/types/lesson';

	let lesson = $state<LessonPayload | null>(null);
	let loading = $state(true);
	let generating = $state(false);
	let savingFeedback = $state(false);
	let errorMsg = $state('');
	let feedbackVisible = $state(false);

	const feedbackComplete = $derived(lesson !== null && lesson.enjoyment !== null);

	async function handleUnauthorized(res: Response) {
		if (isUnauthorized(res)) {
			await goto('/login');
			return true;
		}
		return false;
	}

	async function loadCurrentLesson() {
		const res = await fetch('/api/lesson');
		if (!res.ok) {
			if (await handleUnauthorized(res)) return null;
			throw new Error(await parseApiError(res, 'שגיאה בטעינת השיעור'));
		}
		const data = await res.json();
		return data.lesson as LessonPayload | null;
	}

	async function generateLesson() {
		generating = true;
		errorMsg = '';
		feedbackVisible = false;

		try {
			const res = await fetch('/api/lesson', { method: 'POST' });
			if (!res.ok) {
				if (await handleUnauthorized(res)) return;
				throw new Error(await parseApiError(res, 'שגיאה ביצירת שיעור'));
			}
			const data = await res.json();
			lesson = data.lesson;
			setTimeout(() => {
				feedbackVisible = true;
			}, 3000);
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה ביצירת שיעור';
		} finally {
			generating = false;
			loading = false;
		}
	}

	async function init() {
		loading = true;
		errorMsg = '';

		try {
			const current = await loadCurrentLesson();
			if (current) {
				lesson = current;
				feedbackVisible = true;
			} else {
				await generateLesson();
			}
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בטעינה';
			loading = false;
		} finally {
			if (!generating) loading = false;
		}
	}

	async function saveEnjoyment(enjoyment: number) {
		if (!lesson) return;

		savingFeedback = true;
		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lessonId: lesson.id,
					enjoyment
				})
			});
			if (!res.ok) throw new Error('Failed to save feedback');
			const data = await res.json();
			lesson = data.lesson;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בשמירת משוב';
		} finally {
			savingFeedback = false;
		}
	}

	function handleEnjoyment(score: number) {
		if (!lesson || savingFeedback) return;
		lesson = {
			...lesson,
			enjoyment: score,
			feedback: feedbackFromEnjoyment(score)
		};
		saveEnjoyment(score);
	}

	onMount(() => {
		init();
	});
</script>

<div class="page">
	<header class="app-header">
		<AppLogo />
		<a href="/history" class="nav-pill">היסטוריה</a>
	</header>

	{#if errorMsg}
		<div class="error-banner">
			<p>{errorMsg}</p>
			<button type="button" onclick={() => init()}>נסה שוב</button>
		</div>
	{/if}

	<main class="page-main">
		<div class="lesson-shell">
			<DecorativeBg />

			<LessonView
				topicTitle={lesson?.topicTitle ?? ''}
				domain={lesson?.domain ?? ''}
				segments={lesson?.segments ?? []}
				imageUrl={lesson?.imageUrl}
				youtubeQuery={lesson?.youtubeQuery}
				loading={loading || generating}
			/>

			{#if lesson && !loading && !generating && feedbackVisible}
				<div class="lesson-end">
					<FeedbackBar
						enjoyment={lesson.enjoyment}
						saving={savingFeedback}
						embedded
						onEnjoyment={handleEnjoyment}
					/>

					<BottomAction
						disabled={!feedbackComplete || generating}
						loading={generating}
						embedded
						onclick={generateLesson}
					/>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.page {
		min-height: 100dvh;
		padding: 0 1.25rem 2.5rem;
	}

	.page-main {
		width: 100%;
	}

	.lesson-shell {
		position: relative;
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
	}

	.lesson-end {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-top: 1rem;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 0 1rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.nav-pill {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
		background: var(--surface);
		padding: 0.5rem 1.1rem;
		border-radius: var(--radius-pill);
		text-decoration: none;
		box-shadow: 0 2px 10px var(--shadow);
		transition: transform 0.15s;
	}

	.nav-pill:hover {
		transform: translateY(-1px);
	}

	.error-banner {
		position: relative;
		z-index: 1;
		max-width: 1400px;
		margin: 0 auto 1rem;
		padding: 1rem 1.25rem;
		background: var(--pink);
		border-radius: var(--radius-lg);
		text-align: center;
		box-shadow: 0 4px 16px var(--shadow);
	}

	.error-banner p {
		margin: 0 0 0.75rem;
		color: #c62828;
		font-size: 0.9rem;
	}

	.error-banner button {
		padding: 0.55rem 1.35rem;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--card-dark);
		color: white;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	@media (min-width: 900px) {
		.page {
			padding: 0 2.5rem 3rem;
		}
	}
</style>
