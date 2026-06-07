import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { buildLessonPrompt, parseLessonResponse } from '$lib/prompts/lesson';
import type { UserPreferences } from '$lib/types/lesson';

const MODEL = 'gemini-2.5-flash-lite';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
	if (!genAI) {
		genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	}
	return genAI;
}

export async function generateWithGemini(prefs: UserPreferences) {
	const model = getGenAI().getGenerativeModel({ model: MODEL });
	const prompt = buildLessonPrompt(prefs);

	const result = await model.generateContent(prompt);
	const raw = result.response.text();
	return parseLessonResponse(raw);
}
