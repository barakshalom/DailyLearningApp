<script lang="ts">
	import { SEGMENT_LABELS, SEGMENT_ACCENTS } from '$lib/prompts/lesson';
	import SegmentIcon from '$lib/components/SegmentIcon.svelte';
	import { buildYouTubeSearchUrl } from '$lib/youtube';

	interface Props {
		topicTitle: string;
		domain: string;
		segments: string[];
		imageUrl?: string | null;
		youtubeQuery?: string | null;
		loading?: boolean;
	}

	let {
		topicTitle,
		domain,
		segments,
		imageUrl = null,
		youtubeQuery = null,
		loading = false
	}: Props = $props();

	const CORE_START = 2;
	const CORE_END = 4;
	const CLOSING_START = 6;
	const YOUTUBE_SEGMENT_INDEX = 7;

	function getYouTubeSearchTerm(): string {
		return youtubeQuery ?? segments[YOUTUBE_SEGMENT_INDEX] ?? topicTitle;
	}

	function getYouTubeUrl(): string {
		return buildYouTubeSearchUrl(getYouTubeSearchTerm());
	}
</script>

{#if loading}
	<div class="lesson-panel loading">
		<div class="lesson-layout">
			<div class="skeleton hero-skeleton"></div>
			<div class="skeleton image-panel-skeleton"></div>
			{#each Array(8) as _, i}
				<div class="skeleton card-skeleton" style="animation-delay: {i * 80}ms"></div>
			{/each}
		</div>
	</div>
{:else}
	<div class="lesson-panel">
		<div class="lesson-layout">
			<header class="lesson-hero">
				<span class="domain-pill">{domain}</span>
				<h1 class="title">{topicTitle}</h1>
			</header>

			<aside class="image-panel">
				<div class="image-panel-inner">
					<svg class="corner-star" viewBox="0 0 24 24" fill="var(--yellow)" aria-hidden="true">
						<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
					</svg>
					<span class="image-domain">{domain}</span>
					<div class="image-frame">
						{#if imageUrl}
							<img src={imageUrl} alt="" class="lesson-image" />
						{:else}
							<div class="image-placeholder">
								<span>{domain}</span>
							</div>
						{/if}
					</div>
					<p class="image-topic">{topicTitle}</p>
				</div>
			</aside>

			<div class="segments">
				{#each segments as segment, i}
					{@const accent = SEGMENT_ACCENTS[i]}
					<section
						class="segment-card"
						class:core={i >= CORE_START && i <= CORE_END}
						class:closing={i >= CLOSING_START}
						style="border-top: 3px solid {accent}"
					>
						<div class="segment-header">
							<div class="segment-meta">
								<SegmentIcon index={i} />
								<span class="segment-label">{SEGMENT_LABELS[i]}</span>
							</div>
							<span class="step-badge" style="background: {accent}">{i + 1}/8</span>
						</div>

						{#if i === YOUTUBE_SEGMENT_INDEX}
							{#if youtubeQuery}
								<p class="segment-text">{segment}</p>
								<p class="youtube-line">
									<a
										class="youtube-text-link"
										href={getYouTubeUrl()}
										target="_blank"
										rel="noopener noreferrer"
									>
										{youtubeQuery}
									</a>
								</p>
							{:else}
								<p class="segment-text">
									<a
										class="youtube-text-link"
										href={getYouTubeUrl()}
										target="_blank"
										rel="noopener noreferrer"
									>
										{segment}
									</a>
								</p>
							{/if}
						{:else}
							<p class="segment-text">{segment}</p>
						{/if}
					</section>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.lesson-panel {
		width: 100%;
		position: relative;
		z-index: 1;
	}

	.lesson-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.85rem;
	}

	.lesson-hero {
		grid-row: 1;
		background: linear-gradient(135deg, color-mix(in srgb, var(--mint) 40%, white), color-mix(in srgb, var(--lavender) 40%, white));
		border-radius: var(--radius-lg);
		padding: 1.5rem 1.25rem;
		text-align: center;
		box-shadow: 0 4px 20px var(--shadow);
	}

	.image-panel {
		grid-row: 2;
	}

	.segments {
		grid-row: 3;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.domain-pill {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--lavender);
		padding: 0.35rem 0.9rem;
		border-radius: var(--radius-pill);
		margin-bottom: 0.75rem;
	}

	.title {
		font-size: 1.65rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--text-primary);
		margin: 0;
	}

	.segment-card {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 1.15rem 1.25rem;
		box-shadow: 0 4px 16px var(--shadow);
	}

	.segment-card.core .segment-text {
		font-size: 1.08rem;
		line-height: 1.75;
	}

	.segment-card.closing {
		border-inline-start: 3px solid var(--mint);
	}

	.segment-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.65rem;
		gap: 0.5rem;
	}

	.segment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.segment-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	.step-badge {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-pill);
		flex-shrink: 0;
	}

	.segment-text {
		margin: 0;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-primary);
	}

	.youtube-line {
		margin: 0.5rem 0 0;
		line-height: 1.7;
	}

	.youtube-text-link {
		color: var(--text-muted);
		font-size: 1rem;
		font-weight: 400;
		text-decoration: none;
		transition: color 0.15s;
	}

	.youtube-text-link:hover {
		color: var(--text-primary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.image-panel-inner {
		background: var(--surface);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		border: 2px solid var(--lavender);
		box-shadow: 0 4px 24px color-mix(in srgb, var(--mint) 35%, transparent);
		position: relative;
	}

	.corner-star {
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: 1.25rem;
		height: 1.25rem;
		opacity: 0.7;
	}

	.image-domain {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-primary);
		background: var(--lavender);
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-pill);
		margin-bottom: 0.85rem;
	}

	.image-frame {
		border-radius: 16px;
		overflow: hidden;
		margin-bottom: 0.85rem;
	}

	.lesson-image {
		width: 100%;
		height: 220px;
		object-fit: cover;
		display: block;
	}

	.image-placeholder {
		width: 100%;
		height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
	}

	.image-placeholder span {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.image-topic {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1.4;
		color: var(--text-primary);
		text-align: center;
	}

	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.5) 0%,
			rgba(255, 255, 255, 0.85) 50%,
			rgba(255, 255, 255, 0.5) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
		border-radius: var(--radius-lg);
	}

	.hero-skeleton {
		height: 6rem;
	}

	.card-skeleton {
		height: 5rem;
	}

	.image-panel-skeleton {
		height: 320px;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	@media (min-width: 900px) {
		.lesson-layout {
			grid-template-columns: 1fr min(380px, 32%);
			grid-template-rows: auto 1fr;
			gap: 1rem 1.5rem;
			align-items: start;
		}

		.lesson-hero {
			grid-column: 1;
			grid-row: 1;
			padding: 2rem;
		}

		.segments {
			grid-column: 1;
			grid-row: 2;
		}

		.image-panel {
			grid-column: 2;
			grid-row: 1 / -1;
			position: sticky;
			top: 1.5rem;
		}

		.title {
			font-size: 2rem;
		}

		.lesson-image,
		.image-placeholder {
			height: 280px;
		}
	}
</style>
