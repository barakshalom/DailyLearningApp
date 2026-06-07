import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateLesson } from '$lib/server/lesson-generator';
import { loadUserPreferences } from '$lib/server/preferences';
import { insertLessonRow, selectLatestLesson, toLessonPayload } from '$lib/server/lesson-map';
import { getErrorMessage } from '$lib/server/errors';
import {
	mapGenerationError,
	throwDailyLimit,
	throwUnfinishedLesson
} from '$lib/server/api-errors';
import { canStartNewLesson } from '$lib/server/lesson-limits';
import { tryPooledLesson } from '$lib/server/lesson-pool';
import { knownTopicTitles, loadLessonHistory } from '$lib/server/lesson-context';
import { backfillLessonImage } from '$lib/server/backfill-image';
import { isValidTopic, type TopicKey } from '$lib/topics';

function normalizeCustomTopic(raw: unknown): string | null {
	if (typeof raw !== 'string') return null;
	const trimmed = raw.trim().replace(/\s+/g, ' ');
	if (trimmed.length < 2 || trimmed.length > 80) return null;
	return trimmed;
}

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

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');

	const body = await request.json().catch(() => ({}));
	const topicRaw = body?.topic as string | undefined;
	const topic: TopicKey = topicRaw && isValidTopic(topicRaw) ? topicRaw : 'random';

	let customTopic: string | null = null;
	if (topic === 'custom') {
		customTopic = normalizeCustomTopic(body?.customTopic);
		if (!customTopic) {
			error(400, 'יש להזין נושא (2–80 תווים)');
		}
	}

	try {
		const [latest, limits] = await Promise.all([
			selectLatestLesson(locals.supabase, user.id),
			canStartNewLesson(locals.supabase, user.id)
		]);

		if (latest && latest.enjoyment === null) {
			throwUnfinishedLesson();
		}

		if (!limits.allowed) {
			throwDailyLimit();
		}

		const historyRows = await loadLessonHistory(locals.supabase, user.id);
		const knownTopics = knownTopicTitles(historyRows);

		if (topic !== 'custom') {
			const pooled = await tryPooledLesson(
				locals.supabase,
				user.id,
				topic,
				knownTopics
			);
			if (pooled) {
				return json({ lesson: toLessonPayload(pooled), fromPool: true });
			}
		}

		const prefs = await loadUserPreferences(
			locals.supabase,
			user.id,
			topic,
			customTopic,
			historyRows
		);
		const parsed = await generateLesson(prefs);

		const row = await insertLessonRow(locals.supabase, {
			user_id: user.id,
			topic_title: parsed.topicTitle,
			domain: parsed.domain,
			segments: parsed.segments,
			image_url: null,
			youtube_query: parsed.youtubeQuery,
			requested_topic: topic,
			custom_topic_request: topic === 'custom' ? customTopic : null
		});

		const payload = toLessonPayload(row);

		const backfill = backfillLessonImage(
			locals.supabase,
			row.id,
			user.id,
			parsed.imageQuery
		);
		if (platform?.context?.waitUntil) {
			platform.context.waitUntil(backfill);
		} else {
			void backfill;
		}

		return json({
			lesson: payload,
			imageQuery: parsed.imageQuery
		});
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		mapGenerationError(e);
	}
};
