function isMissingProfilesMessage(message: string): boolean {
	const lower = message.toLowerCase();
	return (
		(lower.includes('profiles') &&
			(lower.includes('does not exist') ||
				lower.includes('permission denied') ||
				lower.includes('relation') ||
				lower.includes('schema cache') ||
				lower.includes('could not find the table'))) ||
		lower.includes('42p01')
	);
}

function mapMessage(message: string): string {
	if (message.includes('permission denied for table lessons')) {
		return 'חסרות הרשאות ב-Supabase — הרץ את supabase/fix_permissions.sql בעורך SQL';
	}
	if (message.includes('youtube_query')) {
		return 'חסרה עמודת youtube_query — הרץ את supabase/add_youtube_query.sql בעורך SQL';
	}
	if (message.includes('requested_topic')) {
		return 'חסרה עמודת requested_topic — הרץ את supabase/add_requested_topic.sql בעורך SQL';
	}
	if (isMissingProfilesMessage(message)) {
		return 'חסרה טבלת profiles — הרץ את supabase/add_profiles.sql בעורך SQL';
	}
	if (message.includes('Expected 8 segments')) {
		return 'Gemini החזיר פורמט לא תקין — נסה שוב';
	}
	if (message.includes('API key') || message.includes('API_KEY')) {
		return 'חסר או שגוי GEMINI_API_KEY ב-.env';
	}
	if (message.includes('Failed to insert lesson')) {
		return 'שגיאה בשמירת השיעור — בדוק הרשאות Supabase';
	}
	if (message.includes('quota') || message.includes('Quota')) {
		return 'הגענו למכסה היומית, נסה מחר';
	}
	if (message.includes('הגעת למכסה היומית')) {
		return message;
	}
	if (message.includes('סיים את השיעור הנוכחי')) {
		return message;
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
