import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { buildLessonPrompt, parseLessonResponse } from '$lib/prompts/lesson';
import type { UserPreferences } from '$lib/types/lesson';

const MODEL = 'gemini-2.5-flash';

export async function generateLesson(prefs: UserPreferences) {
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	const model = genAI.getGenerativeModel({ model: MODEL });
	const prompt = buildLessonPrompt(prefs);

	const result = await model.generateContent(prompt);
	const raw = result.response.text();
	return parseLessonResponse(raw);
}
