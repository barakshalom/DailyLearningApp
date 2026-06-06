<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isUnauthorized, parseApiError } from '$lib/api-errors';
	import AppHeader from '$lib/components/AppHeader.svelte';

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
			<section class="settings-card">
				<h2>גיל</h2>
				<form onsubmit={saveAge}>
					<label for="age">גיל (להתאמת עומק השיעור)</label>
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
			</section>

			<div class="account-col">
				<section class="settings-card">
					<h2>שם משתמש</h2>
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
				</section>

				<section class="settings-card">
					<h2>סיסמה</h2>
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
				</section>
			</div>
		</div>

		<button type="button" class="logout-btn" disabled={loggingOut} onclick={logout}>
			{loggingOut ? 'מתנתק...' : 'התנתק'}
		</button>

		{#if errorMsg}
			<p class="error">{errorMsg}</p>
		{/if}
		{#if successMsg}
			<p class="success">{successMsg}</p>
		{/if}
	{/if}
</main>

<style>
	.settings-page {
		min-height: 100dvh;
		padding: 0 1.25rem 2.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.setup-banner {
		background: var(--yellow);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		line-height: 1.5;
		text-align: right;
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

	.settings-card {
		background: var(--surface);
		border-radius: var(--radius-xl);
		padding: 1.25rem 1.5rem;
		box-shadow: 0 8px 32px var(--shadow-lg);
		text-align: right;
	}

	.settings-card h2 {
		margin: 0 0 0.85rem;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary);
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
	}

	button[type='submit']:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.logout-btn {
		width: 100%;
		margin-top: 1rem;
		padding: 0.95rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: #c62828;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		box-shadow: 0 2px 10px var(--shadow);
	}

	.logout-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.status,
	.error,
	.success {
		text-align: center;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.error {
		color: #c62828;
	}

	.success {
		color: #2e7d32;
	}

	@media (min-width: 900px) {
		.settings-page {
			padding: 0 2.5rem 3rem;
		}

		.settings-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
			align-items: start;
		}
	}
</style>
