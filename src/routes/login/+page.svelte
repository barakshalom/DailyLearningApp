<script lang="ts">
	import { goto } from '$app/navigation';
	import { isSupabaseConfigured, getSupabaseSetupMessage } from '$lib/supabase/config';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';

	type Mode = 'login' | 'register';

	let mode = $state<Mode>('login');
	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMsg = $state('');

	const configured = isSupabaseConfigured();
	const setupMessage = getSupabaseSetupMessage();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!configured) {
			errorMsg = setupMessage;
			return;
		}

		loading = true;
		errorMsg = '';

		const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.message ?? (mode === 'login' ? 'ההתחברות נכשלה' : 'ההרשמה נכשלה'));
			}

			await goto('/');
		} catch (e) {
			if (e instanceof TypeError) {
				errorMsg = 'בעיית רשת — בדוק את חיבור האינטרנט';
			} else {
				errorMsg = e instanceof Error ? e.message : 'שגיאה לא צפויה';
			}
		} finally {
			loading = false;
		}
	}

	function setMode(next: Mode) {
		mode = next;
		errorMsg = '';
	}
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

		<div class="mode-tabs" role="tablist">
			<button
				type="button"
				class:active={mode === 'login'}
				role="tab"
				aria-selected={mode === 'login'}
				onclick={() => setMode('login')}
			>
				התחבר
			</button>
			<button
				type="button"
				class:active={mode === 'register'}
				role="tab"
				aria-selected={mode === 'register'}
				onclick={() => setMode('register')}
			>
				הרשמה
			</button>
		</div>

		<form onsubmit={handleSubmit}>
			<label for="username">שם משתמש</label>
			<input
				id="username"
				type="text"
				bind:value={username}
				placeholder="הזן שם משתמש"
				required
				minlength="2"
				maxlength="32"
				autocomplete="username"
				disabled={!configured || loading}
			/>

			<label for="password">סיסמה</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				placeholder="לפחות 6 תווים"
				required
				minlength="6"
				maxlength="72"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
				disabled={!configured || loading}
			/>

			<button type="submit" disabled={loading || !configured}>
				{#if loading}
					{mode === 'login' ? 'מתחבר...' : 'נרשם...'}
				{:else}
					{mode === 'login' ? 'התחבר' : 'צור חשבון'}
				{/if}
			</button>
		</form>

		{#if errorMsg}
			<p class="error">{errorMsg}</p>
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
		margin: 0 0 1.5rem;
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.mode-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		background: var(--bg);
		padding: 0.35rem;
		border-radius: var(--radius-pill);
	}

	.mode-tabs button {
		flex: 1;
		padding: 0.55rem 1rem;
		border: none;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.mode-tabs button.active {
		background: var(--surface);
		color: var(--text-primary);
		box-shadow: 0 2px 8px var(--shadow);
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

	.error {
		margin: 1rem 0 0;
		color: #c62828;
		font-size: 0.9rem;
	}
</style>
