import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserPreferences } from '$lib/types/lesson';

export async function loadUserPreferences(
	supabase: SupabaseClient,
	userId: string
): Promise<UserPreferences> {
	const { data: lessons, error } = await supabase
		.from('lessons')
		.select('topic_title, domain, segments, feedback, enjoyment')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(100);

	if (error) throw error;

	const learnedTopics: string[] = [];
	const learnedSummaries: string[] = [];
	const domainScores = new Map<string, number>();

	for (const lesson of lessons ?? []) {
		learnedTopics.push(lesson.topic_title);
		const summary = lesson.segments?.[0];
		if (summary) learnedSummaries.push(summary.slice(0, 120));

		if (lesson.enjoyment && lesson.domain) {
			const score = domainScores.get(lesson.domain) ?? 0;
			if (lesson.enjoyment <= 2) {
				domainScores.set(lesson.domain, score - 2);
			} else {
				const boost = lesson.enjoyment >= 4 ? 2 : 1;
				domainScores.set(lesson.domain, score + boost);
			}
		}
	}

	const likedDomains = [...domainScores.entries()]
		.filter(([, score]) => score > 0)
		.sort((a, b) => b[1] - a[1])
		.map(([domain]) => domain);

	const dislikedDomains = [...domainScores.entries()]
		.filter(([, score]) => score < 0)
		.map(([domain]) => domain);

	return { learnedTopics, learnedSummaries, likedDomains, dislikedDomains };
}
