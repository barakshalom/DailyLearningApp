import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserPreferences } from '$lib/types/lesson';
import type { TopicKey } from '$lib/topics';
import { isMissingProfilesError, toError } from '$lib/server/errors';
import type { LessonHistoryRow } from '$lib/server/lesson-context';

async function loadProfileAge(
	supabase: SupabaseClient,
	userId: string
): Promise<number | null> {
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('age')
		.eq('user_id', userId)
		.maybeSingle();

	if (profileError) {
		if (!isMissingProfilesError(profileError.message)) {
			throw toError(profileError, 'שגיאה בטעינת פרופיל');
		}
		return null;
	}

	return profile?.age ?? null;
}

function buildPreferencesFromRows(
	lessons: LessonHistoryRow[],
	topic: TopicKey,
	customTopic: string | null,
	age: number | null
): UserPreferences {
	const learnedTopics: string[] = [];
	const learnedSummaries: string[] = [];
	const domainScores = new Map<string, number>();

	for (const lesson of lessons) {
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

	return {
		learnedTopics: learnedTopics.slice(0, 20),
		learnedSummaries: learnedSummaries.slice(0, 10),
		likedDomains,
		dislikedDomains,
		age,
		preferredTopic: topic,
		customTopic: topic === 'custom' ? customTopic : null
	};
}

export async function loadUserPreferences(
	supabase: SupabaseClient,
	userId: string,
	topic: TopicKey = 'random',
	customTopic: string | null = null,
	preloadedLessons?: LessonHistoryRow[]
): Promise<UserPreferences> {
	const [lessons, age] = await Promise.all([
		preloadedLessons
			? Promise.resolve(preloadedLessons)
			: supabase
					.from('lessons')
					.select('topic_title, domain, segments, feedback, enjoyment')
					.eq('user_id', userId)
					.order('created_at', { ascending: false })
					.limit(30)
					.then(({ data, error }) => {
						if (error) throw toError(error, 'שגיאה בטעינת היסטוריית שיעורים');
						return (data ?? []) as LessonHistoryRow[];
					}),
		loadProfileAge(supabase, userId)
	]);

	return buildPreferencesFromRows(lessons, topic, customTopic, age);
}
