function mapMessage(message: string): string {
	if (message.includes('permission denied for table lessons')) {
		return 'חסרות הרשאות ב-Supabase — הרץ את supabase/fix_permissions.sql בעורך SQL';
	}
	if (message.includes('youtube_query')) {
		return 'חסרה עמודת youtube_query — הרץ את supabase/add_youtube_query.sql בעורך SQL';
	}
	if (message.includes('quota') || message.includes('Quota')) {
		return 'מכסת Gemini מלאה — נסה שוב מאוחר יותר או החלף מפתח API';
	}
	return message;
}

export function isUnauthorized(res: Response): boolean {
	return res.status === 401;
}

export async function parseApiError(res: Response, fallback: string): Promise<string> {
	if (res.status === 401) {
		return 'יש להתחבר מחדש';
	}

	const data = await res.json().catch(() => null);
	const raw =
		(data?.message as string | undefined) ??
		(data?.error as string | undefined) ??
		fallback;

	return mapMessage(raw);
}
