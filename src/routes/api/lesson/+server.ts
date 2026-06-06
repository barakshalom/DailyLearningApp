import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateLesson } from '$lib/server/gemini';
import { loadUserPreferences } from '$lib/server/preferences';
import { fetchLessonImage } from '$lib/server/unsplash';
import type { LessonPayload } from '$lib/types/lesson';

function toPayload(row: {
	id: string;
	topic_title: string;
	domain: string;
	segments: string[];
	image_url: string | null;
	youtube_query: string | null;
	feedback: string | null;
	enjoyment: number | null;
}): LessonPayload {
	return {
		id: row.id,
		topicTitle: row.topic_title,
		domain: row.domain,
		segments: row.segments,
		imageUrl: row.image_url,
		youtubeQuery: row.youtube_query,
		feedback: row.feedback as LessonPayload['feedback'],
		enjoyment: row.enjoyment
	};
}

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const { data, error: dbError } = await locals.supabase
		.from('lessons')
		.select('id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (dbError) error(500, dbError.message);
	if (!data) return json({ lesson: null });

	return json({ lesson: toPayload(data) });
};

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const prefs = await loadUserPreferences(locals.supabase, user.id);
		const parsed = await generateLesson(prefs);
		const image = await fetchLessonImage(parsed.imageQuery);

		const { data, error: dbError } = await locals.supabase
			.from('lessons')
			.insert({
				user_id: user.id,
				topic_title: parsed.topicTitle,
				domain: parsed.domain,
				segments: parsed.segments,
				image_url: image?.url ?? null,
				youtube_query: parsed.youtubeQuery
			})
			.select('id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment')
			.single();

		if (dbError) error(500, dbError.message);

		return json({ lesson: toPayload(data) });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to generate lesson';
		error(500, message);
	}
};
