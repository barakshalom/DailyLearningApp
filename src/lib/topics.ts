export const PRIMARY_TOPICS = [
	{ key: 'random', label: 'רנדומלי' },
	{ key: 'physics', label: 'פיזיקה' },
	{ key: 'psychology', label: 'פסיכולוגיה' },
	{ key: 'history', label: 'היסטוריה' },
	{ key: 'biology', label: 'ביולוגיה' },
	{ key: 'computers', label: 'מחשבים' },
	{ key: 'philosophy', label: 'פילוסופיה' },
	{ key: 'economics', label: 'כלכלה' },
	{ key: 'literature', label: 'ספרות' },
	{ key: 'personal-growth', label: 'התפתחות אישית' }
] as const;

export const CUSTOM_TOPIC = { key: 'custom', label: 'נושא אחר' } as const;

export const MORE_TOPICS = [
	{ key: 'mathematics', label: 'מתמטיקה' },
	{ key: 'chemistry', label: 'כימיה' },
	{ key: 'astronomy', label: 'אסטרונומיה' },
	{ key: 'art', label: 'אמנות' },
	{ key: 'music', label: 'מוזיקה' },
	{ key: 'geography', label: 'גיאוגרפיה' },
	{ key: 'medicine', label: 'רפואה' },
	{ key: 'neuroscience', label: 'מדעי המוח' },
	{ key: 'ecology', label: 'אקולוגיה' },
	{ key: 'politics', label: 'פוליטיקה' },
	{ key: 'law', label: 'משפטים' },
	{ key: 'cinema', label: 'קולנוע' }
] as const;

export const TOPIC_OPTIONS = [...PRIMARY_TOPICS, ...MORE_TOPICS, CUSTOM_TOPIC] as const;

export type TopicKey = (typeof TOPIC_OPTIONS)[number]['key'];

const TOPIC_KEYS = new Set<string>(TOPIC_OPTIONS.map((t) => t.key));
const MORE_TOPIC_KEYS = new Set<string>(MORE_TOPICS.map((t) => t.key));

export function isMoreTopic(key: TopicKey): boolean {
	return MORE_TOPIC_KEYS.has(key);
}

export function isValidTopic(key: string): key is TopicKey {
	return TOPIC_KEYS.has(key);
}

export function getTopicLabel(key: TopicKey): string {
	return TOPIC_OPTIONS.find((t) => t.key === key)?.label ?? key;
}
