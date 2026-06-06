import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	formatAuthError,
	normalizePassword,
	normalizeUsername,
	registerWithCredentials
} from '$lib/server/auth';
import { isSupabaseConfigured, getSupabaseSetupMessage } from '$lib/supabase/config';
import { getSupabaseAdmin } from '$lib/server/supabase-admin';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!isSupabaseConfigured()) {
		error(503, getSupabaseSetupMessage());
	}

	const admin = getSupabaseAdmin();
	if (!admin) {
		error(503, 'חסר SUPABASE_SERVICE_ROLE_KEY ב-.env');
	}

	const body = await request.json();
	const username = body?.username as string | undefined;
	const password = body?.password as string | undefined;

	const normalized = username ? normalizeUsername(username) : null;
	const normalizedPassword = password ? normalizePassword(password) : null;

	if (!normalized) {
		error(400, 'שם משתמש לא תקין (2–32 תווים, אותיות ומספרים)');
	}
	if (!normalizedPassword) {
		error(400, 'סיסמה לא תקינה (6–72 תווים)');
	}

	const { data, error: authError } = await registerWithCredentials(
		admin,
		locals.supabase,
		normalized,
		normalizedPassword
	);

	if (authError) {
		error(400, formatAuthError(authError.message));
	}

	if (!data.session) {
		error(500, 'ההרשמה נכשלה');
	}

	return json({
		ok: true,
		username: normalized,
		displayName: data.user?.user_metadata?.display_name ?? normalized
	});
};
