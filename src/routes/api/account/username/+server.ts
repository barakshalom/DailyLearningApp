import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { changeUsername, normalizeUsername } from '$lib/server/auth';
import { getSupabaseAdmin } from '$lib/server/supabase-admin';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const admin = getSupabaseAdmin();
	if (!admin) {
		error(503, 'חסר SUPABASE_SERVICE_ROLE_KEY ב-.env');
	}

	const body = await request.json();
	const newUsername = body?.newUsername as string | undefined;
	const currentPassword = body?.currentPassword as string | undefined;

	if (!newUsername || !currentPassword) {
		error(400, 'נדרשים שם משתמש חדש וסיסמה לאימות');
	}

	if (!normalizeUsername(newUsername)) {
		error(400, 'שם משתמש לא תקין (2–32 תווים, אותיות ומספרים)');
	}

	const currentUsername =
		(locals.user.user_metadata?.username as string | undefined) ??
		locals.user.email?.split('@')[0];

	if (!currentUsername) {
		error(400, 'לא נמצא שם משתמש');
	}

	const result = await changeUsername(
		admin,
		locals.supabase,
		locals.user.id,
		currentUsername,
		currentPassword,
		newUsername
	);

	if (result.error) {
		error(400, result.error.message);
	}

	return json({
		ok: true,
		username: result.username,
		message: 'שם המשתמש עודכן — התחבר בפעם הבאה עם השם החדש'
	});
};
