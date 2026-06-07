import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchLessonSummaries } from '$lib/server/history-list';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const lessons = await fetchLessonSummaries(locals.supabase, locals.user.id);
	return { lessons };
};
