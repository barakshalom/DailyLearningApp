import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { feedbackFromEnjoyment } from '$lib/feedback';

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

	const { data, error: dbError } = await locals.supabase
		.from('lessons')
		.update({
			feedback,
			enjoyment
		})
		.eq('id', lessonId)
		.eq('user_id', user.id)
		.select('id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment')
		.single();

	if (dbError) error(500, dbError.message);

	return json({
		lesson: {
			id: data.id,
			topicTitle: data.topic_title,
			domain: data.domain,
			segments: data.segments,
			imageUrl: data.image_url,
			youtubeQuery: data.youtube_query,
			feedback: data.feedback,
			enjoyment: data.enjoyment
		}
	});
};
