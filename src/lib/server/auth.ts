import type { SupabaseClient } from '@supabase/supabase-js';

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

export function usernameToEmail(username: string): string {
	return `${username}@dailylearning.internal`;
}

function isUserAlreadyExists(message: string): boolean {
	const lower = message.toLowerCase();
	return lower.includes('already registered') || lower.includes('already exists');
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
	password: string
) {
	const email = usernameToEmail(username);

	const createUser = await admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: { username, display_name: username }
	});

	if (createUser.error) {
		if (isUserAlreadyExists(createUser.error.message)) {
			return {
				data: createUser.data,
				error: new Error('שם המשתמש כבר תפוס — נסה להתחבר')
			};
		}
		return { data: createUser.data, error: createUser.error };
	}

	return supabase.auth.signInWithPassword({ email, password });
}

export function formatAuthError(message: string): string {
	const lower = message.toLowerCase();

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
