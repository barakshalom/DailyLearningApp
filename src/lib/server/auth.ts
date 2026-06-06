import type { SupabaseClient } from '@supabase/supabase-js';
import { USER_EXISTS_MESSAGE } from '$lib/auth-messages';

export { USER_EXISTS_MESSAGE };

export function normalizeUsername(raw: string): string | null {
	const username = raw.trim().toLowerCase();
	if (username.length < 2 || username.length > 32) return null;
	if (!/^[\p{L}\p{N}_-]+$/u.test(username)) return null;
	return username;
}

export function normalizePassword(raw: string): string | null {
	const password = raw;
	if (password.length < 6 || password.length > 72) return null;
	return password;
}

export function normalizeAge(raw: unknown): number | null {
	const age = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
	if (!Number.isInteger(age) || age < 8 || age > 120) return null;
	return age;
}

export function usernameToEmail(username: string): string {
	return `${username}@dailylearning.internal`;
}

export function isUserAlreadyExists(message: string): boolean {
	const lower = message.toLowerCase();
	return (
		lower.includes('already been registered') ||
		lower.includes('already registered') ||
		lower.includes('already exists') ||
		lower.includes('email address has already')
	);
}

export async function signInWithCredentials(
	supabase: SupabaseClient,
	username: string,
	password: string
) {
	const email = usernameToEmail(username);
	return supabase.auth.signInWithPassword({ email, password });
}

export async function registerWithCredentials(
	admin: SupabaseClient,
	supabase: SupabaseClient,
	username: string,
	password: string,
	profile?: { age: number }
) {
	const email = usernameToEmail(username);

	const createUser = await admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: {
			username,
			display_name: username,
			age: profile?.age ?? null
		}
	});

	if (createUser.error) {
		if (isUserAlreadyExists(createUser.error.message)) {
			return {
				data: createUser.data,
				error: new Error(USER_EXISTS_MESSAGE)
			};
		}
		return { data: createUser.data, error: createUser.error };
	}

	return supabase.auth.signInWithPassword({ email, password });
}

export function formatAuthError(message: string): string {
	const lower = message.toLowerCase();

	if (isUserAlreadyExists(message)) {
		return USER_EXISTS_MESSAGE;
	}
	if (lower.includes('email rate limit exceeded')) {
		return 'יותר מדי ניסיונות — נסה שוב בעוד כמה דקות';
	}
	if (
		lower.includes('invalid login credentials') ||
		lower.includes('invalid credentials')
	) {
		return 'שם משתמש או סיסמה שגויים';
	}

	return message;
}

export async function verifyCurrentPassword(
	supabase: SupabaseClient,
	username: string,
	password: string
) {
	const { error } = await signInWithCredentials(supabase, username, password);
	return !error;
}

export async function isUsernameTaken(
	admin: SupabaseClient,
	username: string
): Promise<boolean> {
	const email = usernameToEmail(username);
	const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000, page: 1 });
	if (error) return false;
	return (data.users ?? []).some((u) => u.email?.toLowerCase() === email);
}

export async function changeUsername(
	admin: SupabaseClient,
	supabase: SupabaseClient,
	userId: string,
	currentUsername: string,
	currentPassword: string,
	newUsername: string
) {
	const normalized = normalizeUsername(newUsername);
	if (!normalized) {
		return { error: new Error('שם משתמש לא תקין (2–32 תווים, אותיות ומספרים)') };
	}
	if (normalized === currentUsername) {
		return { error: new Error('זה כבר שם המשתמש שלך') };
	}

	const valid = await verifyCurrentPassword(supabase, currentUsername, currentPassword);
	if (!valid) {
		return { error: new Error('סיסמה שגויה') };
	}

	if (await isUsernameTaken(admin, normalized)) {
		return { error: new Error('שם המשתמש כבר תפוס') };
	}

	const { error } = await admin.auth.admin.updateUserById(userId, {
		email: usernameToEmail(normalized),
		user_metadata: {
			username: normalized,
			display_name: normalized
		}
	});

	if (error) {
		if (isUserAlreadyExists(error.message)) {
			return { error: new Error('שם המשתמש כבר תפוס') };
		}
		return { error };
	}

	return { username: normalized };
}

export async function changePassword(
	supabase: SupabaseClient,
	username: string,
	currentPassword: string,
	newPassword: string
) {
	const normalizedPassword = normalizePassword(newPassword);
	if (!normalizedPassword) {
		return { error: new Error('סיסמה לא תקינה (6–72 תווים)') };
	}

	const valid = await verifyCurrentPassword(supabase, username, currentPassword);
	if (!valid) {
		return { error: new Error('סיסמה נוכחית שגויה') };
	}

	const { error } = await supabase.auth.updateUser({ password: normalizedPassword });
	if (error) {
		return { error: new Error(formatAuthError(error.message)) };
	}

	return { ok: true };
}
