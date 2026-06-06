import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isSupabaseConfigured, getSupabaseSetupMessage } from '$lib/supabase/config';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	if (!isSupabaseConfigured()) {
		error(503, getSupabaseSetupMessage());
	}

	const body = await request.json();
	const email = body?.email as string | undefined;

	if (!email || !email.includes('@')) {
		error(400, 'כתובת מייל לא תקינה');
	}

	const { error: authError } = await locals.supabase.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: `${url.origin}/auth/callback`
		}
	});

	if (authError) {
		error(400, authError.message);
	}

	return json({ ok: true });
};
