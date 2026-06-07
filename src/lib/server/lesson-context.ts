import type { SupabaseClient } from '@supabase/supabase-js';
import { toError } from '$lib/server/errors';

export type LessonHistoryRow = {
	topic_title: string;
	domain: string;
	segments: string[];
	feedback: string | null;
	enjoyment: number | null;
};

const HISTORY_LIMIT = 30;

export async function loadLessonHistory(
	supabase: SupabaseClient,
	userId: string
): Promise<LessonHistoryRow[]> {
	const { data, error: lessonsError } = await supabase
		.from('lessons')
		.select('topic_title, domain, segments, feedback, enjoyment')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(HISTORY_LIMIT);

	if (lessonsError) {
		throw toError(lessonsError, 'שגיאה בטעינת היסטוריית שיעורים');
	}

	return (data ?? []) as LessonHistoryRow[];
}

export function knownTopicTitles(rows: LessonHistoryRow[]): Set<string> {
	return new Set(rows.map((r) => r.topic_title));
}
