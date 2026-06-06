import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateLesson } from '$lib/server/lesson-generator';
import { loadUserPreferences } from '$lib/server/preferences';
import { fetchLessonImage } from '$lib/server/unsplash';
import { insertLessonRow, selectLatestLesson, toLessonPayload } from '$lib/server/lesson-map';
import { getErrorMessage } from '$lib/server/errors';
import {
	mapGenerationError,
	throwDailyLimit,
	throwUnfinishedLesson
} from '$lib/server/api-errors';
import { canStartNewLesson } from '$lib/server/lesson-limits';
import { tryPooledLesson } from '$lib/server/lesson-pool';
import { isValidTopic, type TopicKey } from '$lib/topics';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	try {
		const [row, limits] = await Promise.all([
			selectLatestLesson(locals.supabase, user.id),
			canStartNewLesson(locals.supabase, user.id)
		]);

		const hasUnfinished = row !== null && row.enjoyment === null;

		return json({
			lesson: row ? toLessonPayload(row) : null,
			canStartNew: !hasUnfinished && limits.allowed,
			blockReason: hasUnfinished
				? 'סיים את השיעור הנוכחי לפני שמתחילים חדש'
				: limits.reason,
			lessonsToday: limits.lessonsToday,
			dailyLimit: limits.limit
		});
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
		const latest = await selectLatestLesson(locals.supabase, user.id);
		if (latest && latest.enjoyment === null) {
			throwUnfinishedLesson();
		}

		const limits = await canStartNewLesson(locals.supabase, user.id);
		if (!limits.allowed) {
			throwDailyLimit();
		}

		const pooled = await tryPooledLesson(locals.supabase, user.id, topic);
		if (pooled) {
			return json({ lesson: toLessonPayload(pooled), fromPool: true });
		}

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
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		mapGenerationError(e);
	}
};
