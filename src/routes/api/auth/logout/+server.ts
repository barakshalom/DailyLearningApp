import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut();
	return json({ ok: true });
};
