import { env } from '$env/dynamic/private';
import { buildLessonPrompt, parseLessonResponse } from '$lib/prompts/lesson';
import type { UserPreferences } from '$lib/types/lesson';

const MODEL = 'llama-3.3-70b-versatile';

export function getGroqApiKey(): string | undefined {
	const key = env.GROQ_API_KEY;
	if (!key || key.includes('your-groq')) return undefined;
	return key;
}

export async function generateWithGroq(prefs: UserPreferences) {
	const apiKey = getGroqApiKey();
	if (!apiKey) {
		throw new Error('GROQ_API_KEY not configured');
	}

	const prompt = buildLessonPrompt(prefs);
	const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.8
		})
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Groq API error ${res.status}: ${body}`);
	}

	const data = (await res.json()) as {
		choices: { message: { content: string } }[];
	};
	const raw = data.choices[0]?.message?.content;
	if (!raw) {
		throw new Error('Groq returned empty response');
	}

	return parseLessonResponse(raw);
}
