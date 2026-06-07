import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchLessonSummaries } from '$lib/server/history-list';
import { selectLatestLesson, toLessonPayload } from '$lib/server/lesson-map';
import { canStartNewLesson } from '$lib/server/lesson-limits';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const userId = locals.user.id;
	const [lessons, row, limits] = await Promise.all([
		fetchLessonSummaries(locals.supabase, userId),
		selectLatestLesson(locals.supabase, userId),
		canStartNewLesson(locals.supabase, userId)
	]);

	const hasUnfinished = row !== null && row.enjoyment === null;

	return {
		lessons,
		lessonStatus: {
			lesson: row ? toLessonPayload(row) : null,
			canStartNew: !hasUnfinished && limits.allowed,
			blockReason: hasUnfinished
				? 'סיים את השיעור הנוכחי לפני שמתחילים חדש'
				: limits.reason
		}
	};
};
