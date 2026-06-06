import { isValidTopic, type TopicKey } from '$lib/topics';

const STORAGE_KEY = 'dla-selected-topic';

export function getSelectedTopic(): TopicKey {
	if (typeof localStorage === 'undefined') return 'random';
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored && isValidTopic(stored) ? stored : 'random';
}

export function setSelectedTopic(topic: TopicKey): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, topic);
}
