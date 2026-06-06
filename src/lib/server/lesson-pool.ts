import type { SupabaseClient } from '@supabase/supabase-js';
import type { TopicKey } from '$lib/topics';
import { getSupabaseAdmin } from '$lib/server/supabase-admin';
import { insertLessonRow, type LessonRow } from '$lib/server/lesson-map';
import { toError } from '$lib/server/errors';

const MIN_POOL_ENJOYMENT = 4;

type PooledSource = {
	topic_title: string;
	domain: string;
	segments: string[];
	image_url: string | null;
	youtube_query: string | null;
	requested_topic: string | null;
};

export async function tryPooledLesson(
	supabase: SupabaseClient,
	userId: string,
	topic: TopicKey
): Promise<LessonRow | null> {
	const admin = getSupabaseAdmin();
	if (!admin) return null;

	const { data: userLessons, error: userError } = await supabase
		.from('lessons')
		.select('topic_title')
		.eq('user_id', userId);

	if (userError) {
		throw toError(userError, 'שגיאה בטעינת היסטוריית שיעורים');
	}

	const knownTopics = new Set((userLessons ?? []).map((l) => l.topic_title));

	let query = admin
		.from('lessons')
		.select('topic_title, domain, segments, image_url, youtube_query, requested_topic')
		.gte('enjoyment', MIN_POOL_ENJOYMENT)
		.neq('user_id', userId)
		.eq('requested_topic', topic)
		.order('created_at', { ascending: false })
		.limit(20);

	const { data: candidates, error: poolError } = await query;

	if (poolError) {
		return null;
	}

	const match = (candidates ?? []).find((c) => !knownTopics.has(c.topic_title));
	if (!match) return null;

	return clonePooledLesson(supabase, userId, topic, match as PooledSource);
}

async function clonePooledLesson(
	supabase: SupabaseClient,
	userId: string,
	topic: TopicKey,
	source: PooledSource
): Promise<LessonRow> {
	return insertLessonRow(supabase, {
		user_id: userId,
		topic_title: source.topic_title,
		domain: source.domain,
		segments: source.segments,
		image_url: source.image_url,
		youtube_query: source.youtube_query,
		requested_topic: topic
	});
}
