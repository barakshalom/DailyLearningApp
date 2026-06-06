/**
 * Dev-only: compare lesson output across Gemini Flash, Flash-Lite, and Groq.
 * Usage: node --env-file=.env scripts/test-lesson-providers.mjs
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const SAMPLE_PREFS = {
	learnedTopics: [],
	learnedSummaries: [],
	likedDomains: [],
	dislikedDomains: [],
	age: null,
	preferredTopic: 'science'
};

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

function buildPrompt(prefs) {
	const parts = [BASE_PROMPT];
	if (prefs.preferredTopic !== 'random') {
		parts.push(`\nבחר נושא חדש מתחום "מדע" בלבד. שורת DOMAIN חייבת להיות "מדע".`);
	}
	return parts.join('\n');
}

function parseLessonResponse(raw) {
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

async function testGemini(model) {
	const key = process.env.GEMINI_API_KEY;
	if (!key) throw new Error('GEMINI_API_KEY missing');
	const genAI = new GoogleGenerativeAI(key);
	const m = genAI.getGenerativeModel({ model });
	const result = await m.generateContent(buildPrompt(SAMPLE_PREFS));
	return result.response.text();
}

async function testGroq() {
	const key = process.env.GROQ_API_KEY;
	if (!key) throw new Error('GROQ_API_KEY missing');
	const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'llama-3.3-70b-versatile',
			messages: [{ role: 'user', content: buildPrompt(SAMPLE_PREFS) }],
			temperature: 0.8
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Groq ${res.status}: ${err}`);
	}
	const data = await res.json();
	return data.choices[0].message.content;
}

async function runTest(name, fn) {
	console.log(`\n=== ${name} ===`);
	try {
		const raw = await fn();
		const parsed = parseLessonResponse(raw);
		console.log('PASS — parseLessonResponse succeeded');
		console.log(`  TOPIC: ${parsed.topicTitle}`);
		console.log(`  DOMAIN: ${parsed.domain}`);
		console.log(`  Segments: ${parsed.segments.length}`);
		console.log(`  First segment: ${parsed.segments[0].slice(0, 80)}...`);
		return true;
	} catch (e) {
		console.log(`FAIL — ${e.message}`);
		return false;
	}
}

const prompt = buildPrompt(SAMPLE_PREFS);
console.log(`Prompt length: ${prompt.length} chars`);

const results = {};

results['gemini-2.5-flash'] = await runTest('Gemini 2.5 Flash', () =>
	testGemini('gemini-2.5-flash')
);
results['gemini-2.5-flash-lite'] = await runTest('Gemini 2.5 Flash-Lite', () =>
	testGemini('gemini-2.5-flash-lite')
);

if (process.env.GROQ_API_KEY) {
	results['groq-llama-3.3'] = await runTest('Groq Llama 3.3 70B', testGroq);
} else {
	console.log('\n=== Groq Llama 3.3 70B ===');
	console.log('SKIP — GROQ_API_KEY not set');
	results['groq-llama-3.3'] = null;
}

console.log('\n=== Summary ===');
for (const [k, v] of Object.entries(results)) {
	console.log(`  ${k}: ${v === null ? 'skipped' : v ? 'PASS' : 'FAIL'}`);
}

const groqOk = results['groq-llama-3.3'];
if (groqOk === false) {
	console.log('\nGroq failed Hebrew/parse test — fallback will be disabled in production.');
	process.exit(1);
}
