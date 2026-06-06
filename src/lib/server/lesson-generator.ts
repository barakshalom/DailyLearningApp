import { generateWithGemini } from '$lib/server/gemini';
import { generateWithGroq, getGroqApiKey } from '$lib/server/groq';
import { isQuotaError } from '$lib/server/api-errors';
import type { UserPreferences } from '$lib/types/lesson';

export async function generateLesson(prefs: UserPreferences) {
	try {
		return await generateWithGemini(prefs);
	} catch (e) {
		if (isQuotaError(e) && getGroqApiKey()) {
			return await generateWithGroq(prefs);
		}
		throw e;
	}
}
