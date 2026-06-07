import type { UserPreferences } from '$lib/types/lesson';
import { getTopicLabel } from '$lib/topics';

const BASE_PROMPT = `אתה מורה יוצא דופן שמסביר רעיונות בצורה חדה, מדויקת וזכירה; המטרה שלך היא שאבין לעומק משהו חדש כך שאזכור אותו גם שבוע אחרי; בחר נושא לא טrivialי מתחום כלשהו וצור יחידת לימוד לפי רצף קבוע של 8 קטעים.

פורמט הפלט (חובה):
שורה ראשונה: TOPIC: [כותרת קצרה של הנושא בעברית, עד 8 מילים]
שורה שנייה: DOMAIN: [תחום בעברית, למשל פיזיקה, פסיכולוגיה, היסטוריה]
שורה שלישית: IMAGE_QUERY: [2-4 מילים באנגלית לחיפוש תמונה רלוונטית, למשל "black hole space"]
שורה רביעית: YOUTUBE_QUERY: [2-5 מילים באנגלית לחיפוש סרטון יוטיוב רלוונטי, למשל "time dilation explained"]
לאחר מכן 8 קטעים מופרדים בדיוק על ידי +++ (בלי רווחים מיותרים מסביב)

סדר הקטעים (אל תכתוב כותרות לקטעים):
1. משפט אחד מסקרן במיוחד שיוצר סקרנות
2. למה זה חשוב בעולם האמיתי או בחיים שלי
3. הסבר אינטואיטיבי ישיר של המושג עצמו — בלי אנלוגיות, בלי מטאפורות, בלי השוואות — רק מה שבאמת קורה
4. הסבר עמוק יותר כולל עיקרון או חוק מרכזי
5. דוגמה קונקרטית מהעולם האמיתי
6. שלוש נקודות מפתח קצרות וברורות באותו קטע
7. שאלה מעוררת מחשבה אחת
8. משפט קצר אחד בעברית שמזמין להעמיק, למשל "רוצה להעמיק? צפה בסרטון מומלץ ביוטיוב."

כללים: אל תהיה גנרי או משעמם, אל תכתוב כמו ספר לימוד, אל תשתמש באנלוגיות או מטאפורות בכלל, היה תמציתי אבל עם עומק אמיתי, ובחר נושא מעניין ולא שחוק. כל הפלט חייב להיות בעברית (מלבד IMAGE_QUERY ו-YOUTUBE_QUERY שחייבים להיות באנגלית).`;

function buildAgePrompt(age: number): string {
	let depth = 'עומק מלא כרגיל';
	if (age <= 12) {
		depth = 'משפטים קצרים, מושגים בסיסיים';
	} else if (age <= 17) {
		depth = 'ברור אך לא מתקדם מדי';
	}

	return `\nהלומד בן/בת ${age}. התאם את רמת השפה והעומק:\n- גילאי 8–12: משפטים קצרים, מושגים בסיסיים\n- 13–17: ברור אך לא מתקדם מדי\n- 18+: עומק מלא כרגיל\nבחר את הרמה המתאימה: ${depth}.`;
}

export function buildLessonPrompt(prefs: UserPreferences): string {
	const parts = [BASE_PROMPT];

	if (prefs.age !== null) {
		parts.push(buildAgePrompt(prefs.age));
	}

	if (prefs.preferredTopic === 'custom' && prefs.customTopic) {
		parts.push(
			`\nבחר נושא חדש בדיוק על: "${prefs.customTopic}". שורת DOMAIN יכולה לתאר את התחום הרלוונטי.`
		);
	} else if (prefs.preferredTopic !== 'random') {
		const label = getTopicLabel(prefs.preferredTopic);
		parts.push(
			`\nבחר נושא חדש מתחום "${label}" בלבד. שורת DOMAIN חייבת להיות "${label}".`
		);
	}

	if (prefs.learnedTopics.length > 0) {
		parts.push(
			`\nהנושאים שלמדתי בעבר (אל תחזור עליהם ואל תבחר נושאים דומים):\n${prefs.learnedTopics.join(', ')}`
		);
	}

	if (prefs.learnedSummaries.length > 0) {
		parts.push(
			`\nסיכומי נושאים שכבר למדתי (הימנע מחזרה):\n${prefs.learnedSummaries.join('\n')}`
		);
	}

	if (prefs.likedDomains.length > 0) {
		parts.push(`\nתחומים שאהבתי: ${prefs.likedDomains.join(', ')}`);
		parts.push('בחר נושא חדש מתחום שאהבתי או דומה לו.');
	}

	if (prefs.dislikedDomains.length > 0) {
		parts.push(`\nתחומים שלא אהבתי (הימנע מהם): ${prefs.dislikedDomains.join(', ')}`);
	}

	return parts.join('\n');
}

export interface ParsedLesson {
	topicTitle: string;
	domain: string;
	imageQuery: string;
	youtubeQuery: string;
	segments: string[];
}

export const SEGMENT_ACCENTS = [
	'var(--mint)',
	'var(--lavender)',
	'var(--yellow)',
	'var(--pink)',
	'var(--mint)',
	'var(--lavender)',
	'var(--yellow)',
	'var(--pink)'
] as const;

export function parseLessonResponse(raw: string): ParsedLesson {
	let text = raw.trim();
	let topicTitle = 'נושא חדש';
	let domain = 'כללי';
	let imageQuery = 'learning education';
	let youtubeQuery = 'educational explained';

	const topicMatch = text.match(/^TOPIC:\s*(.+)$/m);
	if (topicMatch) {
		topicTitle = topicMatch[1].trim();
		text = text.replace(/^TOPIC:\s*.+\n?/m, '');
	}

	const domainMatch = text.match(/^DOMAIN:\s*(.+)$/m);
	if (domainMatch) {
		domain = domainMatch[1].trim();
		text = text.replace(/^DOMAIN:\s*.+\n?/m, '');
	}

	const imageMatch = text.match(/^IMAGE_QUERY:\s*(.+)$/m);
	if (imageMatch) {
		imageQuery = imageMatch[1].trim();
		text = text.replace(/^IMAGE_QUERY:\s*.+\n?/m, '');
	}

	const youtubeMatch = text.match(/^YOUTUBE_QUERY:\s*(.+)$/m);
	if (youtubeMatch) {
		youtubeQuery = youtubeMatch[1].trim();
		text = text.replace(/^YOUTUBE_QUERY:\s*.+\n?/m, '');
	}

	const segments = text
		.split('+++')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	if (segments.length !== 8) {
		throw new Error(`Expected 8 segments, got ${segments.length}`);
	}

	return { topicTitle, domain, imageQuery, youtubeQuery, segments };
}

export const SEGMENT_LABELS = [
	'סקרנות',
	'למה זה חשוב',
	'ההסבר',
	'עומק',
	'דוגמה מהחיים',
	'שלוש נקודות מפתח',
	'שאלה לחשיבה',
	'למידה נוספת'
] as const;
