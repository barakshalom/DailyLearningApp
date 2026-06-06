import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { feedbackFromEnjoyment } from '$lib/feedback';

const SELECT_WITH_YOUTUBE =
	'id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment';
const SELECT_WITHOUT_YOUTUBE = 'id, topic_title, domain, segments, image_url, feedback, enjoyment';

function isMissingYoutubeColumn(message: string): boolean {
	return message.toLowerCase().includes('youtube_query');
}

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

	let result = await locals.supabase
		.from('lessons')
		.update({ feedback, enjoyment })
		.eq('id', lessonId)
		.eq('user_id', user.id)
		.select(SELECT_WITH_YOUTUBE)
		.single();

	if (result.error && isMissingYoutubeColumn(result.error.message)) {
		result = await locals.supabase
			.from('lessons')
			.update({ feedback, enjoyment })
			.eq('id', lessonId)
			.eq('user_id', user.id)
			.select(SELECT_WITHOUT_YOUTUBE)
			.single();
	}

	if (result.error) error(500, result.error.message);

	const data = result.data as {
		id: string;
		topic_title: string;
		domain: string;
		segments: string[];
		image_url: string | null;
		youtube_query?: string | null;
		feedback: string | null;
		enjoyment: number | null;
	};

	return json({
		lesson: {
			id: data.id,
			topicTitle: data.topic_title,
			domain: data.domain,
			segments: data.segments,
			imageUrl: data.image_url,
			youtubeQuery: data.youtube_query ?? null,
			feedback: data.feedback,
			enjoyment: data.enjoyment
		}
	});
};
