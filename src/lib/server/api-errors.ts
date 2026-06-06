import { error } from '@sveltejs/kit';

export const MSG_UNFINISHED_LESSON = 'סיים את השיעור הנוכחי לפני שמתחילים חדש';
export const MSG_DAILY_LIMIT = 'הגעת למכסה היומית של שיעורים — נסה שוב מחר';
export const MSG_QUOTA_EXHAUSTED = 'הגענו למכסה היומית, נסה מחר';

export function isQuotaError(err: unknown): boolean {
	const message = getErrMessage(err).toLowerCase();
	return (
		message.includes('quota') ||
		message.includes('resource_exhausted') ||
		message.includes('resource exhausted') ||
		message.includes('rate limit') ||
		message.includes('429') ||
		message.includes('too many requests') ||
		message.includes('503') ||
		message.includes('service unavailable') ||
		message.includes('high demand')
	);
}

function getErrMessage(err: unknown): string {
	if (err instanceof Error) return err.message;
	if (typeof err === 'string') return err;
	if (err && typeof err === 'object' && 'message' in err) {
		const message = (err as { message: unknown }).message;
		if (typeof message === 'string') return message;
	}
	return '';
}

export function throwUnfinishedLesson(): never {
	error(409, MSG_UNFINISHED_LESSON);
}

export function throwDailyLimit(): never {
	error(429, MSG_DAILY_LIMIT);
}

export function throwQuotaExhausted(): never {
	error(429, MSG_QUOTA_EXHAUSTED);
}

export function mapGenerationError(err: unknown): never {
	if (isQuotaError(err)) {
		throwQuotaExhausted();
	}
	const message = getErrMessage(err);
	error(500, message || 'שגיאה ביצירת שיעור');
}
