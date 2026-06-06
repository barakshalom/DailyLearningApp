import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { feedbackFromEnjoyment } from '$lib/feedback';
import { toLessonPayload, updateLessonFeedback } from '$lib/server/lesson-map';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const body = await request.json();
	const { lessonId, enjoyment } = body as {
		lessonId: string;
		enjoyment: number;
	};

	if (!lessonId || enjoyment === undefined) {
		error(400, 'lessonId and enjoyment are required');
	}

	if (enjoyment < 1 || enjoyment > 5) {
		error(400, 'enjoyment must be between 1 and 5');
	}

	const feedback = feedbackFromEnjoyment(enjoyment);

	try {
		const row = await updateLessonFeedback(
			locals.supabase,
			user.id,
			lessonId,
			feedback,
			enjoyment
		);
		return json({ lesson: toLessonPayload(row) });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to update feedback';
		error(500, message);
	}
};
