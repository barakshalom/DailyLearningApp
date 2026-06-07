import { isValidTopic, type TopicKey } from '$lib/topics';

const STORAGE_KEY = 'dla-selected-topic';
const CUSTOM_TOPIC_KEY = 'dla-custom-topic';

export function getSelectedTopic(): TopicKey {
	if (typeof localStorage === 'undefined') return 'random';
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && isValidTopic(stored) ? stored : 'random';
}

export function setSelectedTopic(topic: TopicKey): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, topic);
}

export function getCustomTopic(): string {
	if (typeof localStorage === 'undefined') return '';
	return localStorage.getItem(CUSTOM_TOPIC_KEY) ?? '';
}

export function setCustomTopic(text: string): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(CUSTOM_TOPIC_KEY, text);
}
