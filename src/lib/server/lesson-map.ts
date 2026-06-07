import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidTopic, type TopicKey } from '$lib/topics';
import type { LessonPayload } from '$lib/types/lesson';
import { toError } from '$lib/server/errors';

export type LessonRow = {
	id: string;
	topic_title: string;
	domain: string;
	segments: string[];
	image_url: string | null;
	youtube_query?: string | null;
	requested_topic?: string | null;
	custom_topic_request?: string | null;
	feedback: string | null;
	enjoyment: number | null;
};

export function toLessonPayload(row: LessonRow): LessonPayload {
	const requestedTopic: TopicKey =
		row.requested_topic && isValidTopic(row.requested_topic)
			? row.requested_topic
			: 'random';

	return {
		id: row.id,
		topicTitle: row.topic_title,
		domain: row.domain,
		segments: row.segments,
		imageUrl: row.image_url,
		youtubeQuery: row.youtube_query ?? null,
		feedback: row.feedback as LessonPayload['feedback'],
		enjoyment: row.enjoyment,
		requestedTopic,
		customTopicRequest: row.custom_topic_request ?? null
	};
}

export const SELECT_WITH_ALL =
	'id, topic_title, domain, segments, image_url, youtube_query, requested_topic, custom_topic_request, feedback, enjoyment';
export const SELECT_WITHOUT_CUSTOM_TOPIC =
	'id, topic_title, domain, segments, image_url, youtube_query, requested_topic, feedback, enjoyment';
export const SELECT_WITHOUT_YOUTUBE =
	'id, topic_title, domain, segments, image_url, requested_topic, feedback, enjoyment';
export const SELECT_WITHOUT_REQUESTED_TOPIC =
	'id, topic_title, domain, segments, image_url, youtube_query, feedback, enjoyment';
export const SELECT_MINIMAL =
	'id, topic_title, domain, segments, image_url, feedback, enjoyment';

const SELECT_ATTEMPTS = [
	SELECT_WITH_ALL,
	SELECT_WITHOUT_CUSTOM_TOPIC,
	SELECT_WITHOUT_YOUTUBE,
	SELECT_WITHOUT_REQUESTED_TOPIC,
	SELECT_MINIMAL
] as const;

export function isMissingYoutubeColumn(message: string): boolean {
	return message.toLowerCase().includes('youtube_query');
}

export function isMissingRequestedTopicColumn(message: string): boolean {
	return message.toLowerCase().includes('requested_topic');
}

export function isMissingCustomTopicRequestColumn(message: string): boolean {
	return message.toLowerCase().includes('custom_topic_request');
}

function isRetryableColumnError(message: string): boolean {
	return (
		isMissingYoutubeColumn(message) ||
		isMissingRequestedTopicColumn(message) ||
		isMissingCustomTopicRequestColumn(message)
	);
}

function buildInsertPayload(
	insertBase: Record<string, unknown>,
	select: string
): Record<string, unknown> {
	const payload = { ...insertBase };
	if (!select.includes('youtube_query')) delete payload.youtube_query;
	if (!select.includes('requested_topic')) delete payload.requested_topic;
	if (!select.includes('custom_topic_request')) delete payload.custom_topic_request;
	return payload;
}

export async function selectLatestLesson(supabase: SupabaseClient, userId: string) {
	for (const select of SELECT_ATTEMPTS) {
		const result = await supabase
			.from('lessons')
			.select(select)
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (!result.error) {
			return result.data as unknown as LessonRow | null;
		}
		if (!isRetryableColumnError(result.error.message)) {
			throw toError(result.error, 'שגיאה בטעינת שיעור');
		}
	}

	return null;
}

export async function selectLessonById(
	supabase: SupabaseClient,
	userId: string,
	lessonId: string
): Promise<LessonRow | null> {
	for (const select of SELECT_ATTEMPTS) {
		const result = await supabase
			.from('lessons')
			.select(select)
			.eq('id', lessonId)
			.eq('user_id', userId)
			.maybeSingle();

		if (!result.error) {
			return result.data as unknown as LessonRow | null;
		}
		if (!isRetryableColumnError(result.error.message)) {
			throw toError(result.error, 'שגיאה בטעינת שיעור');
		}
	}

	return null;
}

export async function insertLessonRow(
	supabase: SupabaseClient,
	insertBase: Record<string, unknown>
): Promise<LessonRow> {
	for (const select of SELECT_ATTEMPTS) {
		const result = await supabase
			.from('lessons')
			.insert(buildInsertPayload(insertBase, select))
			.select(select)
			.single();

		if (!result.error) {
			return result.data as unknown as LessonRow;
		}
		if (!isRetryableColumnError(result.error.message)) {
			throw toError(result.error, 'שגיאה בשמירת שיעור');
		}
	}

	throw new Error('Failed to insert lesson');
}

export async function updateLessonFeedback(
	supabase: SupabaseClient,
	userId: string,
	lessonId: string,
	feedback: string,
	enjoyment: number
): Promise<LessonRow> {
	for (const select of SELECT_ATTEMPTS) {
		const result = await supabase
			.from('lessons')
			.update({ feedback, enjoyment })
			.eq('id', lessonId)
			.eq('user_id', userId)
			.select(select)
			.single();

		if (!result.error) {
			return result.data as unknown as LessonRow;
		}
		if (!isRetryableColumnError(result.error.message)) {
			throw toError(result.error, 'שגיאה בעדכון משוב');
		}
	}

	throw new Error('Failed to update lesson feedback');
}
