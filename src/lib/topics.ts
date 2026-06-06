export const TOPIC_OPTIONS = [
	{ key: 'random', label: 'רנדומלי' },
	{ key: 'physics', label: 'פיזיקה' },
	{ key: 'literature', label: 'ספרות' },
	{ key: 'personal-growth', label: 'התפתחות אישית' },
	{ key: 'computers', label: 'מחשבים' },
	{ key: 'psychology', label: 'פסיכולוגיה' },
	{ key: 'history', label: 'היסטוריה' },
	{ key: 'biology', label: 'ביולוגיה' },
	{ key: 'philosophy', label: 'פילוסופיה' },
	{ key: 'economics', label: 'כלכלה' }
] as const;

export type TopicKey = (typeof TOPIC_OPTIONS)[number]['key'];

const TOPIC_KEYS = new Set<string>(TOPIC_OPTIONS.map((t) => t.key));

export function isValidTopic(key: string): key is TopicKey {
	return TOPIC_KEYS.has(key);
}

export function getTopicLabel(key: TopicKey): string {
	return TOPIC_OPTIONS.find((t) => t.key === key)?.label ?? key;
}
