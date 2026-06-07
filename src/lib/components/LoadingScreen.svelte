<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';

	interface Props {
		message?: string;
		fullscreen?: boolean;
	}

	let { message = 'טוען...', fullscreen = true }: Props = $props();
</script>

<div
	class="loading-screen"
	class:fullscreen
	role="status"
	aria-live="polite"
	aria-busy="true"
	aria-label={message}
>
	<DecorativeBg />

	<div class="loading-content">
		<AppLogo size="lg" />
		<div class="dots" aria-hidden="true">
			<span class="dot mint"></span>
			<span class="dot lavender"></span>
			<span class="dot yellow"></span>
		</div>
		<p class="message">{message}</p>
	</div>
</div>

<style>
	.loading-screen {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 12rem;
		padding: 2rem 1.5rem;
		animation: fadeIn 0.25s ease-out;
	}

	.loading-screen.fullscreen {
		position: fixed;
		inset: 0;
		z-index: 100;
		min-height: 100dvh;
		background: var(--bg);
	}

	.loading-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		text-align: center;
	}

	.dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
	}

	.dot {
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 50%;
		animation: pulse 1.2s ease-in-out infinite;
	}

	.dot.mint {
		background: var(--mint);
		animation-delay: 0ms;
	}

	.dot.lavender {
		background: var(--lavender);
		animation-delay: 160ms;
	}

	.dot.yellow {
		background: var(--yellow);
		animation-delay: 320ms;
	}

	.message {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes pulse {
		0%,
		80%,
		100% {
			transform: scale(0.75);
			opacity: 0.45;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
