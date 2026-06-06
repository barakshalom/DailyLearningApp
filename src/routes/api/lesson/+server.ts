import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateLesson } from '$lib/server/gemini';
import { loadUserPreferences } from '$lib/server/preferences';
import { fetchLessonImage } from '$lib/server/unsplash';
import type { LessonPayload } from '$lib/types/lesson';

const SELECT_WITH_YOUTUBE =
	'id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment';
const SELECT_WITHOUT_YOUTUBE = 'id, topic_title, domain, segments, image_url, feedback, enjoyment';

type LessonRow = {
	id: string;
	topic_title: string;
	domain: string;
	segments: string[];
	image_url: string | null;
	youtube_query?: string | null;
	feedback: string | null;
	enjoyment: number | null;
};

function isMissingYoutubeColumn(message: string): boolean {
	return message.toLowerCase().includes('youtube_query');
}

function toPayload(row: LessonRow): LessonPayload {
	return {
		id: row.id,
		topicTitle: row.topic_title,
		domain: row.domain,
		segments: row.segments,
		imageUrl: row.image_url,
		youtubeQuery: row.youtube_query ?? null,
		feedback: row.feedback as LessonPayload['feedback'],
		enjoyment: row.enjoyment
	};
}

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	let result = await locals.supabase
		.from('lessons')
		.select(SELECT_WITH_YOUTUBE)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (result.error && isMissingYoutubeColumn(result.error.message)) {
		result = await locals.supabase
			.from('lessons')
			.select(SELECT_WITHOUT_YOUTUBE)
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();
	}

	if (result.error) error(500, result.error.message);
	if (!result.data) return json({ lesson: null });

	return json({ lesson: toPayload(result.data as LessonRow) });
};

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const prefs = await loadUserPreferences(locals.supabase, user.id);
		const parsed = await generateLesson(prefs);
		const image = await fetchLessonImage(parsed.imageQuery);

		const insertBase = {
			user_id: user.id,
			topic_title: parsed.topicTitle,
			domain: parsed.domain,
			segments: parsed.segments,
			image_url: image?.url ?? null
		};

		let result = await locals.supabase
			.from('lessons')
			.insert({ ...insertBase, youtube_query: parsed.youtubeQuery })
			.select(SELECT_WITH_YOUTUBE)
			.single();

		if (result.error && isMissingYoutubeColumn(result.error.message)) {
			result = await locals.supabase
				.from('lessons')
				.insert(insertBase)
				.select(SELECT_WITHOUT_YOUTUBE)
				.single();
		}

		if (result.error) error(500, result.error.message);

		return json({ lesson: toPayload(result.data as LessonRow) });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to generate lesson';
		error(500, message);
	}
};
