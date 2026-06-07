import type { TopicKey } from '$lib/topics';

export type Feedback = 'liked' | 'disliked' | null;

export interface LessonSummary {
	id: string;
	topic_title: string;
	domain: string;
	created_at: string;
	enjoyment: number | null;
	segmentPreview: string | null;
}

export interface Lesson {
	id: string;
	user_id: string;
	topic_title: string;
	domain: string;
	segments: string[];
	image_url: string | null;
	youtube_query: string | null;
	feedback: Feedback;
	enjoyment: number | null;
	requested_topic?: string;
	custom_topic_request?: string | null;
	created_at: string;
}

export interface LessonPayload {
	id: string;
	topicTitle: string;
	domain: string;
	segments: string[];
	imageUrl: string | null;
	youtubeQuery: string | null;
	feedback: Feedback;
	enjoyment: number | null;
	requestedTopic: TopicKey;
	customTopicRequest?: string | null;
}

export interface UserPreferences {
	learnedTopics: string[];
	learnedSummaries: string[];
	likedDomains: string[];
	dislikedDomains: string[];
	age: number | null;
	preferredTopic: TopicKey;
	customTopic?: string | null;
}
