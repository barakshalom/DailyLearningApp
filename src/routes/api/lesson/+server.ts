import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateLesson } from '$lib/server/gemini';
import { loadUserPreferences } from '$lib/server/preferences';
import { fetchLessonImage } from '$lib/server/unsplash';
import { insertLessonRow, selectLatestLesson, toLessonPayload } from '$lib/server/lesson-map';
import { getErrorMessage } from '$lib/server/errors';
import { isValidTopic, type TopicKey } from '$lib/topics';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const row = await selectLatestLesson(locals.supabase, user.id);
		if (!row) return json({ lesson: null });
		return json({ lesson: toLessonPayload(row) });
	} catch (e) {
		error(500, getErrorMessage(e, 'שגיאה בטעינת השיעור'));
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const body = await request.json().catch(() => ({}));
	const topicRaw = body?.topic as string | undefined;
	const topic: TopicKey = topicRaw && isValidTopic(topicRaw) ? topicRaw : 'random';

	try {
		const prefs = await loadUserPreferences(locals.supabase, user.id, topic);
		const parsed = await generateLesson(prefs);
		const image = await fetchLessonImage(parsed.imageQuery);

		const row = await insertLessonRow(locals.supabase, {
			user_id: user.id,
			topic_title: parsed.topicTitle,
			domain: parsed.domain,
			segments: parsed.segments,
			image_url: image?.url ?? null,
			youtube_query: parsed.youtubeQuery,
			requested_topic: topic
		});

		return json({ lesson: toLessonPayload(row) });
	} catch (e) {
		error(500, getErrorMessage(e, 'שגיאה ביצירת שיעור'));
	}
};
