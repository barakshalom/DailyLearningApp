import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { changePassword, normalizePassword } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const body = await request.json();
	const currentPassword = body?.currentPassword as string | undefined;
	const newPassword = body?.newPassword as string | undefined;

	if (!currentPassword || !newPassword) {
		error(400, 'נדרשת סיסמה נוכחית וסיסמה חדשה');
	}

	if (!normalizePassword(newPassword)) {
		error(400, 'סיסמה לא תקינה (6–72 תווים)');
	}

	const username =
		(locals.user.user_metadata?.username as string | undefined) ??
		locals.user.email?.split('@')[0];

	if (!username) {
		error(400, 'לא נמצא שם משתמש');
	}

	const result = await changePassword(
		locals.supabase,
		username,
		currentPassword,
		newPassword
	);

	if (result.error) {
		error(400, result.error.message);
	}

	return json({ ok: true, message: 'הסיסמה עודכנה בהצלחה' });
};
