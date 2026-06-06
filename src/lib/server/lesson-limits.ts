import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { toError } from '$lib/server/errors';

export function getMaxLessonsPerDay(): number {
	const raw = env.MAX_LESSONS_PER_DAY;
	if (!raw) return 1;
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : 1;
}

function startOfTodayUtc(): string {
	const now = new Date();
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	return start.toISOString();
}

export async function countLessonsToday(
	supabase: SupabaseClient,
	userId: string
): Promise<number> {
	const { count, error: countError } = await supabase
		.from('lessons')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.gte('created_at', startOfTodayUtc());

	if (countError) {
		throw toError(countError, 'שגיאה בבדיקת מכסה יומית');
	}

	return count ?? 0;
}

export async function canStartNewLesson(
	supabase: SupabaseClient,
	userId: string
): Promise<{ allowed: boolean; reason: string | null; lessonsToday: number; limit: number }> {
	const limit = getMaxLessonsPerDay();
	const lessonsToday = await countLessonsToday(supabase, userId);
	const allowed = lessonsToday < limit;
	return {
		allowed,
		reason: allowed ? null : 'הגעת למכסה היומית של שיעורים — נסה שוב מחר',
		lessonsToday,
		limit
	};
}
