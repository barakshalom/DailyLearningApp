import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchLessonSummaries } from '$lib/server/history-list';
import { getErrorMessage } from '$lib/server/errors';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const lessons = await fetchLessonSummaries(locals.supabase, user.id);
		return json({ lessons });
	} catch (e) {
		error(500, getErrorMessage(e, 'שגיאה בטעינת ההיסטוריה'));
	}
};
