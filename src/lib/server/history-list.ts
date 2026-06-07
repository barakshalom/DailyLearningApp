import type { SupabaseClient } from '@supabase/supabase-js';
import type { LessonSummary } from '$lib/types/lesson';
import { toError } from '$lib/server/errors';

export type { LessonSummary };

type LessonRow = {
	id: string;
	topic_title: string;
	domain: string;
	created_at: string;
	enjoyment: number | null;
	segments: string[] | null;
};

export function toLessonSummary(row: LessonRow): LessonSummary {
	const segments = row.segments ?? [];
	return {
		id: row.id,
		topic_title: row.topic_title,
		domain: row.domain,
		created_at: row.created_at,
		enjoyment: row.enjoyment,
		segmentPreview: segments[0]?.slice(0, 200) ?? null
	};
}

export async function fetchLessonSummaries(
	supabase: SupabaseClient,
	userId: string,
	limit = 50
): Promise<LessonSummary[]> {
	const { data, error: dbError } = await supabase
		.from('lessons')
		.select('id, topic_title, domain, created_at, enjoyment, segments')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit);

	if (dbError) {
		throw toError(dbError, 'שגיאה בטעינת ההיסטוריה');
	}

	return ((data ?? []) as LessonRow[]).map(toLessonSummary);
}
