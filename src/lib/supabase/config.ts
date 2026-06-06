import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function isSupabaseConfigured(): boolean {
	return (
		Boolean(PUBLIC_SUPABASE_URL) &&
		Boolean(PUBLIC_SUPABASE_ANON_KEY) &&
		!PUBLIC_SUPABASE_URL.includes('your-project') &&
		PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here'
	);
}

export function getSupabaseSetupMessage(): string {
	return 'יש להגדיר את Supabase בקובץ .env — ראה .env.example';
}
