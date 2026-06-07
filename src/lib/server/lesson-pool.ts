import type { SupabaseClient } from '@supabase/supabase-js';
import type { TopicKey } from '$lib/topics';
import { getSupabaseAdmin } from '$lib/server/supabase-admin';
import { insertLessonRow, type LessonRow } from '$lib/server/lesson-map';

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
	topic: TopicKey,
	knownTopics: Set<string>
): Promise<LessonRow | null> {
	const admin = getSupabaseAdmin();
	if (!admin) return null;

	const { data: candidates, error: poolError } = await admin
		.from('lessons')
		.select('topic_title, domain, segments, image_url, youtube_query, requested_topic')
		.gte('enjoyment', MIN_POOL_ENJOYMENT)
		.neq('user_id', userId)
		.eq('requested_topic', topic)
		.order('created_at', { ascending: false })
		.limit(20);

	if (poolError) {
		return null;
	}

	const match = (candidates ?? []).find((c) => !knownTopics.has(c.topic_title));
	if (!match) return null;

	return insertLessonRow(supabase, {
		user_id: userId,
		topic_title: match.topic_title,
		domain: match.domain,
		segments: match.segments,
		image_url: match.image_url,
		youtube_query: match.youtube_query,
		requested_topic: topic
	});
}
