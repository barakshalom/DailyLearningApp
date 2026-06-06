const PROFILES_MIGRATION_HINT =
	'חסרה טבלת profiles — הרץ את supabase/add_profiles.sql בעורך SQL';

export function getErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof Error) return err.message;
	if (typeof err === 'string') return err;
	if (err && typeof err === 'object' && 'message' in err) {
		const message = (err as { message: unknown }).message;
		if (typeof message === 'string') return message;
	}
	return fallback;
}

export function toError(err: unknown, fallback: string): Error {
	return new Error(getErrorMessage(err, fallback));
}

export function isMissingProfilesError(message: string): boolean {
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

export function profilesMigrationMessage(): string {
	return PROFILES_MIGRATION_HINT;
}
