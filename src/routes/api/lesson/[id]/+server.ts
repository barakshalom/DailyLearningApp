import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { selectLessonById, toLessonPayload } from '$lib/server/lesson-map';
import { getErrorMessage } from '$lib/server/errors';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const row = await selectLessonById(locals.supabase, user.id, params.id);
		if (!row) error(404, 'השיעור לא נמצא');
		return json({ lesson: toLessonPayload(row) });
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		error(500, getErrorMessage(e, 'שגיאה בטעינת השיעור'));
	}
};
