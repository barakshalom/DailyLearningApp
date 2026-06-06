<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import DecorativeBg from '$lib/components/DecorativeBg.svelte';
	import AccentCard from '$lib/components/AccentCard.svelte';

	let age = $state('');
	let newUsername = $state('');
	let usernamePassword = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let loading = $state(true);
	let setupRequired = $state(false);
	let savingAge = $state(false);
	let savingUsername = $state(false);
	let savingPassword = $state(false);
	let loggingOut = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/profile');
			if (!res.ok) {
				if (isUnauthorized(res)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(res, 'שגיאה בטעינת ההגדרות'));
			}
			const data = await res.json();
			age = data.age != null ? String(data.age) : '';
			setupRequired = data.setupRequired === true;
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בטעינה';
		} finally {
			loading = false;
		}
	});

	function clearMessages() {
		errorMsg = '';
		successMsg = '';
	}

	async function saveAge(e: SubmitEvent) {
		e.preventDefault();
		clearMessages();
		savingAge = true;

		const ageNum = Number(age);
		if (!Number.isInteger(ageNum) || ageNum < 8 || ageNum > 120) {
			errorMsg = 'גיל לא תקין (8–120)';
			savingAge = false;
			return;
		}

		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ age: ageNum })
			});
			if (!res.ok) {
				if (isUnauthorized(res)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(res, 'שגיאה בשמירה'));
			}
			setupRequired = false;
			successMsg = 'הגיל נשמר';
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בשמירה';
		} finally {
			savingAge = false;
		}
	}

	async function saveUsername(e: SubmitEvent) {
		e.preventDefault();
		clearMessages();
		savingUsername = true;

		try {
			const res = await fetch('/api/account/username', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					newUsername,
					currentPassword: usernamePassword
				})
			});
			if (!res.ok) {
				if (isUnauthorized(res)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(res, 'שגיאה בעדכון שם המשתמש'));
			}
			const data = await res.json();
			successMsg = data.message ?? 'שם המשתמש עודכן';
			newUsername = '';
			usernamePassword = '';
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בעדכון שם המשתמש';
		} finally {
			savingUsername = false;
		}
	}

	async function savePassword(e: SubmitEvent) {
		e.preventDefault();
		clearMessages();

		if (newPassword !== confirmPassword) {
			errorMsg = 'הסיסמאות החדשות לא תואמות';
			return;
		}

		savingPassword = true;

		try {
			const res = await fetch('/api/account/password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword })
			});
			if (!res.ok) {
				if (isUnauthorized(res)) {
					await goto('/login');
					return;
				}
				throw new Error(await parseApiError(res, 'שגיאה בעדכון הסיסמה'));
			}
			successMsg = 'הסיסמה עודכנה בהצלחה';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'שגיאה בעדכון הסיסמה';
		} finally {
			savingPassword = false;
		}
	}

	async function logout() {
		loggingOut = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			await goto('/login');
		} catch {
			errorMsg = 'שגיאה בהתנתקות';
			loggingOut = false;
		}
	}
</script>

<main class="settings-page">
	<div class="settings-shell">
		<DecorativeBg />

		<div class="settings-content">
			<AppHeader variant="sub" title="הגדרות" wide />

			{#if loading}
				<p class="status">טוען...</p>
			{:else}
				{#if setupRequired}
					<div class="setup-banner">
						<p>
							<strong>נדרשת הגדרת מסד נתונים</strong> — הרץ את
							<code>supabase/add_profiles.sql</code> בעורך SQL של Supabase כדי לשמור גיל.
						</p>
					</div>
				{/if}

				<div class="settings-grid">
					<AccentCard title="גיל" accent="mint">
						{#snippet titleIcon()}
							<svg viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
								<path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="2" />
							</svg>
						{/snippet}
						<p class="helper">משפיע על עומק ושפת השיעורים — מותאם לגיל שלך.</p>
						<form onsubmit={saveAge}>
							<label for="age">גיל (8–120)</label>
							<input
								id="age"
								type="number"
								bind:value={age}
								required
								min="8"
								max="120"
								inputmode="numeric"
								disabled={savingAge}
							/>
							<button type="submit" disabled={savingAge}>
								{savingAge ? 'שומר...' : 'שמור גיל'}
							</button>
						</form>
					</AccentCard>

					<div class="account-col">
						<AccentCard title="שם משתמש" accent="lavender">
							{#snippet titleIcon()}
								<svg viewBox="0 0 24 24" fill="none">
									<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
									<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" />
								</svg>
							{/snippet}
							<form onsubmit={saveUsername}>
								<label for="new-username">שם משתמש חדש</label>
								<input
									id="new-username"
									type="text"
									bind:value={newUsername}
									required
									minlength="2"
									maxlength="32"
									autocomplete="username"
									disabled={savingUsername}
								/>
								<label for="username-password">סיסמה לאימות</label>
								<input
									id="username-password"
									type="password"
									bind:value={usernamePassword}
									required
									autocomplete="current-password"
									disabled={savingUsername}
								/>
								<button type="submit" disabled={savingUsername}>
									{savingUsername ? 'מעדכן...' : 'עדכן שם משתמש'}
								</button>
							</form>
						</AccentCard>

						<AccentCard title="סיסמה" accent="yellow">
							{#snippet titleIcon()}
								<svg viewBox="0 0 24 24" fill="none">
									<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" />
									<path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" stroke-width="2" />
								</svg>
							{/snippet}
							<form onsubmit={savePassword}>
								<label for="current-password">סיסמה נוכחית</label>
								<input
									id="current-password"
									type="password"
									bind:value={currentPassword}
									required
									autocomplete="current-password"
									disabled={savingPassword}
								/>
								<label for="new-password">סיסמה חדשה</label>
								<input
									id="new-password"
									type="password"
									bind:value={newPassword}
									required
									minlength="6"
									maxlength="72"
									autocomplete="new-password"
									disabled={savingPassword}
								/>
								<label for="confirm-password">אימות סיסמה חדשה</label>
								<input
									id="confirm-password"
									type="password"
									bind:value={confirmPassword}
									required
									minlength="6"
									maxlength="72"
									autocomplete="new-password"
									disabled={savingPassword}
								/>
								<button type="submit" disabled={savingPassword}>
									{savingPassword ? 'מעדכן...' : 'עדכן סיסמה'}
								</button>
							</form>
						</AccentCard>
					</div>
				</div>

				<div class="logout-card">
					<AccentCard accent="pink">
						<button type="button" class="logout-btn" disabled={loggingOut} onclick={logout}>
							{loggingOut ? 'מתנתק...' : 'התנתק'}
						</button>
					</AccentCard>
				</div>

				{#if errorMsg}
					<p class="error">{errorMsg}</p>
				{/if}
				{#if successMsg}
					<p class="success">{successMsg}</p>
				{/if}
			{/if}
		</div>
	</div>
</main>

<style>
	.settings-page {
		min-height: 100dvh;
		padding: 0 1.25rem 2.5rem;
	}

	.settings-shell {
		position: relative;
		max-width: 1400px;
		margin: 0 auto;
		min-height: calc(100dvh - 2rem);
	}

	.settings-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.setup-banner {
		background: var(--yellow);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		font-size: 0.9rem;
		line-height: 1.5;
		text-align: right;
		box-shadow: 0 4px 16px var(--shadow);
	}

	.setup-banner p {
		margin: 0;
		color: var(--text-primary);
	}

	.setup-banner code {
		font-size: 0.8rem;
		background: rgba(0, 0, 0, 0.06);
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.account-col {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.helper {
		margin: -0.35rem 0 0.85rem;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--text-muted);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
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

	input[type='number'] {
		direction: ltr;
		text-align: right;
	}

	button[type='submit'] {
		margin-top: 0.35rem;
		padding: 0.85rem;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--mint);
		color: var(--card-dark);
		font-size: 0.95rem;
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

	.logout-card :global(.accent-card) {
		padding: 0.85rem 1.5rem;
	}

	.logout-btn {
		display: block;
		width: auto;
		margin: 0 auto;
		padding: 0.5rem 1.25rem;
		border: none;
		border-radius: var(--radius-pill);
		background: transparent;
		color: #c62828;
		font-size: 0.88rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
	}

	.logout-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.status,
	.error,
	.success {
		text-align: center;
		font-size: 0.9rem;
	}

	.error {
		color: #c62828;
	}

	.success {
		color: #2e7d28;
	}

	@media (min-width: 900px) {
		.settings-page {
			padding: 0 2.5rem 3rem;
		}

		.settings-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
			align-items: stretch;
		}

		.settings-grid > :global(.accent-card:first-child) {
			min-height: 100%;
		}
	}
</style>
