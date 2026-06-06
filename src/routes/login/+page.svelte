<script lang="ts">
	import { page } from '$app/stores';
	import { isSupabaseConfigured, getSupabaseSetupMessage } from '$lib/supabase/config';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let errorMsg = $state('');

	const configured = isSupabaseConfigured();
	const setupMessage = getSupabaseSetupMessage();

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();

		if (!configured) {
			errorMsg = setupMessage;
			return;
		}

		loading = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.message ?? 'שליחת הקישור נכשלה');
			}

			sent = true;
		} catch (e) {
			if (e instanceof TypeError) {
				errorMsg = 'בעיית רשת — בדוק את חיבור האינטרנט והגדרות Supabase';
			} else {
				errorMsg = e instanceof Error ? e.message : 'שגיאה לא צפויה';
			}
		} finally {
			loading = false;
		}
	}

	const authError = $derived($page.url.searchParams.get('error') === 'auth');
</script>

<main class="login-page">
	<DecorativeBg />
	<div class="login-card">
		<div class="logo-wrap">
			<AppLogo size="lg" />
		</div>
		<p class="subtitle">5 דקות ביום, משהו חדש ללמוד</p>

		{#if !configured}
			<div class="setup-notice">
				<p><strong>נדרשת הגדרה</strong></p>
				<p>{setupMessage}</p>
				<ol>
					<li>צור פרויקט ב-<a href="https://supabase.com/dashboard" target="_blank" rel="noopener">Supabase</a></li>
					<li>הרץ את <code>supabase/schema.sql</code> בעורך SQL</li>
					<li>העתק URL ו-Anon Key לקובץ <code>.env</code></li>
					<li>הפעל מחדש את <code>npm run dev</code></li>
				</ol>
			</div>
		{/if}

		{#if authError}
			<p class="error">ההתחברות נכשלה. נסה שוב.</p>
		{/if}

		{#if sent}
			<div class="success">
				<p>שלחנו לך קישור למייל</p>
				<p class="hint">לחץ על הקישור כדי להתחבר</p>
			</div>
		{:else}
			<form onsubmit={handleLogin}>
				<label for="email">הזן את המייל שלך</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					dir="ltr"
					autocomplete="email"
					disabled={!configured}
				/>
				<button type="submit" disabled={loading || !configured}>
					{loading ? 'שולח...' : 'שלח קישור התחברות'}
				</button>
			</form>
			{#if errorMsg}
				<p class="error">{errorMsg}</p>
			{/if}
		{/if}
	</div>
</main>

<style>
	.login-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		position: relative;
	}

	.login-card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 24rem;
		text-align: center;
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 2.5rem 2rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
	}

	.logo-wrap {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		margin: 0 0 2rem;
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.setup-notice {
		text-align: right;
		background: var(--yellow);
		border-radius: var(--radius-lg);
		padding: 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.setup-notice p {
		margin: 0 0 0.5rem;
		color: var(--text-primary);
	}

	.setup-notice ol {
		margin: 0.5rem 0 0;
		padding-right: 1.25rem;
		color: var(--text-muted);
	}

	.setup-notice a {
		color: var(--accent);
	}

	.setup-notice code {
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.06);
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: right;
	}

	label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	input {
		padding: 0.85rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		background: var(--bg);
		color: var(--text-primary);
		font-family: inherit;
	}

	input:focus {
		outline: 2px solid var(--mint);
	}

	input:disabled {
		opacity: 0.5;
	}

	button[type='submit'] {
		margin-top: 0.5rem;
		padding: 0.95rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--mint);
		color: var(--card-dark);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 4px 16px var(--shadow);
		transition: transform 0.15s;
	}

	button[type='submit']:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	button[type='submit']:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.success {
		padding: 1rem;
		background: var(--yellow);
		border-radius: var(--radius-lg);
	}

	.success p {
		margin: 0;
		color: var(--text-primary);
		font-weight: 600;
	}

	.hint {
		margin-top: 0.5rem !important;
		font-weight: 400 !important;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.error {
		margin: 1rem 0 0;
		color: #c62828;
		font-size: 0.9rem;
	}
</style>
